import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import { Context, Handler } from 'wezi-types'
import { send } from 'wezi-send'
import composer from 'wezi-composer'

export const errorHandler = (ctx: Context) => {
    const status = ctx.error.statusCode || 500
    send(ctx, status, ctx.error.message)
}

export const listen = (run: RequestListener, port: number) => new Promise((resolve, reject) => {
    const server = http.createServer(run)
    server.on('listening', resolve)
    server.on('error', reject)
    return server.listen(port)
})

const run = (...handlers: Handler[]) => (errHandler: Handler = errorHandler) => {
    return (req: IncomingMessage, res: ServerResponse) => {
        const dispatch = composer(true, handlers)
        const context: Context = {
            req
            , res
            , next: null
            , error: null
            , errorHandler: errHandler
        }

        dispatch(context)
    }
}

export default run