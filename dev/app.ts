import app, { Context, NextFunction } from 'application'
import { isDev } from 'utils'
import { send } from 'senders'
import { createError } from 'error'
import router from './router'

const log = (ctx: Context) => console.log(ctx.req.method)
const handleNotFound = (_ctx: Context, next: NextFunction) => next(createError(404, 'Not found'))
const handleErrors = (ctx: Context) => {
    const statusCode = ctx.error.statusCode || 500
    const message = ctx.error.message || 'Internal Server Error'
    const payload = isDev() ? ctx.error.stack : message
    send(ctx, statusCode, payload)
}

export default app(
    log
    , router
    , handleNotFound
    , handleErrors
)
