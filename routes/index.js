const KoaRouter = require('koa-router')
const router = new KoaRouter()
const bcrypt = require('bcrypt')

const ERRORS = require('../common/errors')
const { PATIENT, DELIVERY_MAN, DOCTOR, PHARMACIST } = require('../common/enums')

router.get('/', async ctx => {
    ctx.body = JSON.stringify('Hello Koa!')
})

router.post('/login', async ctx => {
    const type = DOCTOR//TODO

    ctx.session.type = type

    ctx.status = 200
    ctx.body = {type}
})

router.get('/logout', async ctx => {
    ctx.session.type = null
})

router.get('/type', async ctx => {
    ctx.body = { type: ctx.session.type }
})

module.exports = router