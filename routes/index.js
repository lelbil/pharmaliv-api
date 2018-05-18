'use strict'

const uuid = require('uuid/v4')
const KoaRouter = require('koa-router')
const router = new KoaRouter()

const db = require('../db')
const signup = require('../services/signup')
const ERRORS = require('../common/errors')
const CONSTANTS = require('../common/constants')

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

    const { type, id } = dbUser

    ctx.session.type = type
    ctx.session.userId = id
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
        const result = await signup.registerNewUser(body)

        ctx.session.type = result.loginInfo.type
        ctx.session.userId = result.loginInfo.id
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

router.get('/logout', async ctx => {
    ctx.session.type = null
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

    ctx.body = await db('panier').select('*').where({ patientId: userInfoId }).leftJoin('medicament', 'panier.medicamentId', 'medicament.id')
})

module.exports = router