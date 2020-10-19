import createApp, { Context, NextFunction } from 'application'
import { isDev } from 'utils'
import { send } from 'senders'
import { createError } from 'error'
import router from './router'

const handleNotFound = (_ctx: Context, next: NextFunction) => next(createError(404, 'Not found'))
const handleErrors = (ctx: Context) => {
    const statusCode = ctx.error.statusCode || 500
    const message = ctx.error.message || 'Internal Server Error'
    const payload = isDev() ? ctx.error.stack : message
    send(ctx, statusCode, payload)
}

const app = createApp(
    router
    , handleNotFound
    , handleErrors
)

export default app
