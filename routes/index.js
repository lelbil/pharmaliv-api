'use strict'

const uuid = require('uuid/v4')
const KoaRouter = require('koa-router')
const router = new KoaRouter()

const db = require('../db')
const ERRORS = require('../common/errors')
const { PATIENT, DELIVERY_MAN, DOCTOR, PHARMACIST } = require('../common/enums')

router.get('/', async ctx => {
    ctx.body = JSON.stringify('Hello Koa!')
})

router.post('/login', async ctx => {
    //TODO: validate that the request body has (strictly) ctx.request.body

    const [{ type }] = await db.select('type').from('user').where(ctx.request.body)

    ctx.session.type = type

    ctx.status = 200
    ctx.body = { type }
})

router.post('/signup', async ctx => {
    //TODO: validate body + type must be one of possible types
    //TODO: encrypt

    const newUser = ctx.request.body

    const [ duplicate ] =  await db.select().from('user').where({ user: newUser.user })
    if (duplicate) {
        ctx.status = 400
        ctx.body = `Username ${newUser.user} already exists!`
        return
    }

    newUser.id = uuid()

    ctx.body = (await db('user').insert(newUser).returning('*'))[0]
})

router.get('/logout', async ctx => {
    ctx.session.type = null
})

router.get('/type', async ctx => {
    ctx.body = { type: ctx.session.type }
})

module.exports = router