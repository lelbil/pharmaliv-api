'use strict'

const uuid = require('uuid/v4')
const KoaRouter = require('koa-router')
const router = new KoaRouter()

const db = require('../db')
const signup = require('../services/signup')
const ERRORS = require('../common/errors')
const { PATIENT, DELIVERY_MAN, DOCTOR, PHARMACIST } = require('../common/enums')

router.get('/', async ctx => {
    ctx.body = JSON.stringify('Hello Koa!')
})

router.post('/login', async ctx => {
    //TODO: validate that the request body has (strictly) ctx.request.body

    const [ dbUser ] = await db.select('type').from('user').where(ctx.request.body)
    if (! dbUser ) {
        ctx.session.type = null
        ctx.session.userId = null
        ctx.status = 401
        ctx.body = null
        return
    }

    const { type, id } = dbUser

    ctx.session.type = type
    ctx.session.userId = id
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

router.get('/type', async ctx => {
    ctx.body = { type: ctx.session.type }
})

module.exports = router