import http from 'http'
import createApp, { Context } from 'application'
import { send } from 'senders'
import router from './router'

const notFound = (ctx: Context) => send(ctx.res, 404)
// const serverError = (_req: IncomingMessage, res: ServerResponse) => {
//     const error = isDev() ? err : null
//     res.status(err.status || 500)
//     if (error) send(err.status, error)
//     else res.end()
// }

const middlewares = [
    ...router
    , notFound
    // , serverError
]

const app = createApp(middlewares)
http
    .createServer(app)
    .listen(5000)
