const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const session = require('koa-session')
const _ = require('lodash')

const errors = require('./common/errors')
const router = require('./routes')

const app = new Koa()
const PORT = process.env.PORT || 3005

app.keys = ['changeThisSecret'] //TODO

app
    .use(cors({ credentials: true }))
    .use(bodyParser())
    .use(session(app))
    .use(async (ctx, next) => {
        ctx.set('Content-Type', 'application/json');
    try {
        await next()
    }
    catch(error) {
        if (_.includes(errors.VALIDATION_ERRORS, error.name)) {
            ctx.status = 400
            return ctx.body = error
        } else if (error.name === errors.NOT_FOUND) {
            ctx.status = 404
            return ctx.body = error
        } else if (error.name === errors.AUTHORIZATION_ERROR) {
            ctx.status = 401
            return ctx.body = error
        }

        console.log('INTERNAL ERROR', error)
        ctx.status = 500
        ctx.body = {
            error: "unknown error"
        }
    }
    })
    .use(router.routes())
    .use(router.allowedMethods())

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`)
})