'use strict'

const uuid = require('uuid/v4')
const KoaRouter = require('koa-router')
const router = new KoaRouter()
const _ = require('lodash')
const AWS = require('aws-sdk')

const hash = require('string-hash')

const db = require('../db')
const signup = require('../services/signup')
const ERRORS = require('../common/errors')
const CONSTANTS = require('../common/constants')

const accessKeyId = process.env.ACCESS_KEY_ID
const secretAccessKey = process.env.SECRET_ACCESS_KEY

let s3
if (accessKeyId && secretAccessKey) {
    s3 = new AWS.S3({
        accessKeyId, secretAccessKey, region: 'eu-west-3'
    })
} else {
    s3 = new AWS.S3()
    AWS.config.loadFromPath('cdnCreds.json')
}

router.get('/', async ctx => {
    ctx.body = JSON.stringify('Hello Koa!')
})

router.post('/login', async ctx => {
    //TODO: validate that the request body has (strictly) ctx.request.body

    const [ dbUser ] = await db.select().from('user').where(ctx.request.body)

    const typeTable = CONSTANTS.contentToTypeMapping[dbUser.type]
    const [ userInfo ] = await db.select().from(typeTable).where({ userId: dbUser.id })

    if ( !dbUser || !userInfo ) {
        ctx.session = null
        ctx.status = 401
        ctx.body = null
        return
    }

    const { type, id, profilePic } = dbUser

    ctx.session.type = type
    ctx.session.userId = id
    ctx.session.profilePic = profilePic
    ctx.session.nom = userInfo.nom
    ctx.session.prenom = userInfo.prenom
    ctx.session.denomination = userInfo.denomination
    ctx.session.dob = userInfo.dob
    ctx.session.nss = userInfo.nss
    ctx.session.siren = userInfo.siren
    ctx.session.userInfoId = userInfo.id

    ctx.status = 200
    ctx.body = { type }
})

router.post('/signup', async ctx => {
    //TODO: validate body + type must be one of possible types
    //TODO: encrypt
    const { body } = ctx.request

    try {
        const result = await signup.registerOrUpdateUser(body)

        ctx.session.type = result.loginInfo.type
        ctx.session.userId = result.loginInfo.id
        ctx.session.profilePic = result.loginInfo.profilePic
        ctx.session.nom = result.additionalInfo.nom
        ctx.session.prenom = result.additionalInfo.prenom
        ctx.session.denomination = result.additionalInfo.denomination
        ctx.session.dob = result.additionalInfo.dob
        ctx.session.nss = result.additionalInfo.nss
        ctx.session.siren = result.additionalInfo.siren
        ctx.session.userInfoId = result.additionalInfo.id

        ctx.status = 201
        ctx.body = result
    } catch (error) {
        if (error.name === ERRORS.ALREADY_EXISTS_ERROR) {
            ctx.status = 400
            ctx.body = `Username ${body.user} already exists!`
            return
        }
        ctx.status = 500
        console.log('Error occurred while registering user:', error)
    }
})

router.put('/signup', async ctx => {
    //TODO: validate body + type must be one of possible types
    //TODO: encrypt
    const { body } = ctx.request
    const { userId, userInfoId } = ctx.request.query

    try {
        const result = await signup.registerOrUpdateUser(body, true, userId, userInfoId)

        ctx.session.type = result.loginInfo.type
        ctx.session.userId = result.loginInfo.id
        ctx.session.profilePic = result.loginInfo.profilePic
        ctx.session.nom = result.additionalInfo.nom
        ctx.session.prenom = result.additionalInfo.prenom
        ctx.session.denomination = result.additionalInfo.denomination
        ctx.session.dob = result.additionalInfo.dob
        ctx.session.nss = result.additionalInfo.nss
        ctx.session.siren = result.additionalInfo.siren
        ctx.session.userInfoId = result.additionalInfo.id

        ctx.status = 201
        ctx.body = result
    } catch (error) {
        ctx.status = 500
        console.log('Error occurred while updating user:', error)
    }
})

router.get('/info', async ctx => {
    const { userId, userInfoId, type } = ctx.session
    let tableName = ''
    let t
    for (t in CONSTANTS.contentToTypeMapping) {
        if (t === type) tableName = CONSTANTS.contentToTypeMapping[t]
    }

    const [user] = await db('user').select().where({ id: userId })
    const [userInfo] = await db(tableName).select().where({ id: userInfoId })

    ctx.body = { ...user, ...userInfo, }
})

router.get('/logout', async ctx => {
    ctx.session = null
})

router.get('/session', async ctx => {
    ctx.body = ctx.session
})

router.post('/medicament', async ctx => {
    const { type, userInfoId } = ctx.session
    if (!type ) {
        ctx.status = 401
        return
    }
    if (type !== 'pharmacistContent') {
        ctx.status = 403
        return
    }

    const newMedicament = {
        id: uuid(),
        ...ctx.request.body,
        pharmacieId: userInfoId,
    }

    ctx.body = (await db('medicament').insert(newMedicament).returning('*'))[0]
    ctx.status = 201
})

router.get('/medicament', async ctx => {
    ctx.body = await db('medicament').select('*')
})

router.get('/mesMedicaments', async ctx => {
    const { type, userInfoId } = ctx.session
    if (!type ) {
        ctx.status = 401
        return
    }
    if (type !== 'pharmacistContent') {
        ctx.status = 403
        return
    }
    ctx.body = await db('medicament').select('*').where({ pharmacieId: userInfoId })
})

router.get('/pharmacies', async ctx => {
    ctx.body = await db('pharmacie').select('*')
})

router.post('/addToCart', async ctx => {
    const { type, userInfoId } = ctx.session
    if (!type ) {
        ctx.status = 401
        return
    }
    if (type !== 'patientContent') {
        ctx.status = 403
        return
    }

    const newCartItem = {
        id: uuid(),
        patientId: userInfoId,
        medicamentId: ctx.request.body.medicamentId,
        quantite: ctx.request.body.quantite,
        ordered: false,
    }

    ctx.body = (await db('panier').insert(newCartItem).returning('*'))[0]
    ctx.status = 201
})

router.get('/cart', async ctx => {
    const { type, userInfoId } = ctx.session
    if (!type ) {
        ctx.status = 401
        return
    }
    if (type !== 'patientContent') {
        ctx.status = 403
        return
    }

    ctx.body = await db('panier')
        .select(['panier.id as panier_id', '*'])
        .where({ patientId: userInfoId, ordered: false })
        .join('medicament', 'panier.medicamentId', 'medicament.id')
})

router.delete('/cart/:id', async ctx => {
    const { id } = ctx.params
    //TODO: add verification that the deleter is the cart owner
    ctx.body = await db('panier').del().where({ id, ordered: false })
})

router.post('/order', async ctx => {
    //TODO: add verification that the one ordering this is the cart owner
    const { panier } = ctx.request.body
    const { ordonnanceURL, type } = ctx.request.body
    const relations = []
    const commandes = []

    _.forEach(_.groupBy(panier, 'pharmacieId'), (pharmacyElements, pharmacieId) => {
        const commandeId = uuid()

        relations.push(...(pharmacyElements.map(({ panier_id: panierId }) => {
            return {
                panierId,
                commandeId,
            }
        })))
        commandes.push({
            id: commandeId,
            type: type || 'domicile',
            livreurId: null,
            pharmacieId,
            etat: 'ordered',
            ordonnanceURL,
        })
    })

    await Promise.all([
        db('commande').insert(commandes),
        db('panier').update({ ordered: true }).whereIn('id', panier.map(panier => panier.panier_id))
    ])
    await db('panierCommande').insert(relations)

    ctx.status = 200
})

router.put('/order/:id', async ctx => {
    const { id } = ctx.params
    const { type, userInfoId } = ctx.session
    const body = ctx.request.body
    if ( body.etat === 'accepted' && type === 'deliveryManContent' ) body.livreurId = userInfoId
    else if ( body.etat === 'accepted' && type !== 'deliveryManContent' ) {
        ctx.status = 400
        ctx.body = 'You don\'t have the appropriate privileges to perform this action'
        return
    }

    await db('commande').update(ctx.request.body).where({ id })

    ctx.status = 204
})

router.get('/sign-s3', async ctx => {
    const {fileName, fileType} = ctx.request.query
    const hashedFileName = hash(fileName).toString()

    const s3Params = {
        Bucket: 'profilpics',
        Key: hashedFileName,
        ContentType: fileType,
        ACL: 'public-read'
    }

    return ctx.body = { signedRequest: s3.getSignedUrl('putObject', s3Params), url: `https://profilpics.s3.eu-west-3.amazonaws.com/${hashedFileName}` }
})

router.get('/:route/:etat', async ctx => {
    const { etat, route } = ctx.params
    const { type, userInfoId } = ctx.session

    if (CONSTANTS.orderStates.indexOf(etat) < 0 && etat !== 'postorder' && route !== 'myPharmacyOrders' && route !== 'deliveries') {
        ctx.status = 400
        ctx.body = 'this state of order does not exist'
        return
    }
    if (type !== 'pharmacistContent' && type !== 'deliveryManContent' && type !== 'patientContent') {
        ctx.status = 403
        return
    }

    let onGoingDeliveries = false
    if (type === 'deliveryManContent') {
        onGoingDeliveries = (await db('commande').select()
            .where({ livreurId: userInfoId, etat: 'accepted' })
            .orWhere({ livreurId: userInfoId, etat: 'pickedup' })).length > 0
    }

    const rawData = await db('panierCommande').select('patient.nom as patient_nom',
        'patient.adresse as patient_adresse',
        'pharmacie.denomination as pharmacie_nom',
        'pharmacie.adresse as pharmacie_adresse' ,
        '*')
        .join('panier', 'panierCommande.panierId', 'panier.id')
        .join('commande', 'panierCommande.commandeId', 'commande.id')
        .join('patient', 'panier.patientId', 'patient.id')
        .join('medicament', 'panier.medicamentId', 'medicament.id')
        .join('pharmacie', 'commande.pharmacieId', 'pharmacie.id')
        .modify(qb => {
            if (route === 'myPharmacyOrders') {
                qb.where('commande.pharmacieId', userInfoId)

                if (etat === 'postorder') qb.where('etat', '!=', 'ordered')
                else qb.where('etat', etat)
            }
            else if (onGoingDeliveries && etat !== 'postorder') {
                qb.where({
                    'commande.livreurId': userInfoId,
                    etat: 'accepted',
                })
                qb.orWhere({
                    'commande.livreurId': userInfoId,
                    etat: 'pickedup',
                })
            } else if (route === 'deliveries') {
                if (etat !== 'postorder') qb.where({
                    etat,
                    type: 'domicile',
                    'commande.livreurId': null,
                })
                else {
                    qb.where('etat', '!=', 'accepted')
                    qb.andWhere('etat', '!=', 'pickedup')
                    qb.where('livreurId', userInfoId)
                }
            } else if (route === 'mymeds') {
                qb.where({
                    'panier.patientId': userInfoId,
                    ordered: true,
                })
            }
        })

    const commandes = _.groupBy(rawData, 'commandeId')

    const getDetailWithCount = detail => (detail.quantite === 1) ? detail.nom : `${detail.quantite}x ${detail.nom}`

    const getDetails = details => {
        if (details.length === 1) return getDetailWithCount(details[0])
        return details.map(detail => getDetailWithCount(detail))
    }

    let commandeId
    const result = []
    for (commandeId in commandes) {
        if (commandes.hasOwnProperty(commandeId)) {
            const details = commandes[commandeId]
            const f = details[0]
            result.push({
                commandeId,
                date: Date.parse(f.orderedAt)/1000,
                nom: `${f.prenom} ${f.patient_nom}`,
                address: f.adresse,
                patientAddress: f.patient_adresse,
                details: getDetails(details),
                etat: f.etat,
                pharmacy: f.pharmacie_nom,
                pharmacyAddress: f.pharmacie_adresse,
                ordonnanceURL: f.ordonnanceURL,
                type: f.type,
            })
        }
    }

    ctx.body = result
})

module.exports = router