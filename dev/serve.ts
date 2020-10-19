import http from 'http'
import createApp, { Context, NextFunction } from 'application'
import { send } from 'senders'
import router from './router'

const middle = (_ctx: Context, next: NextFunction) => {
    next()
}

const handleNotFound = (ctx: Context) => send(ctx, 404)
// const handlerError = (_req: IncomingMessage, res: ServerResponse) => {
//     const error = isDev() ? err : null
//     res.status(err.status || 500)
//     if (error) send(err.status, error)
//     else res.end()
// }

const app = createApp(...router, middle, handleNotFound)
http
    .createServer(app)
    .listen(5000)
