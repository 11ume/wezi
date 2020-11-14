import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { Context, Handler } from 'wezi-types'
import { send } from 'wezi-send'
import { isProd } from './utils'

const defaultErrorHandler = (ctx: Context) => {
    const status = ctx.error.statusCode || 500
    const message = ctx.error.message || 'unknown'
    if (isProd()) {
        send(ctx, status)
        return
    }
    if (message) {
        send(ctx, status, {
            message
        })
        return
    }

    send(ctx, status, {
        message
    })
}

const run = (...handlers: Handler[]) => (errorHandler: Handler = defaultErrorHandler) => {
    return (req: IncomingMessage, res: ServerResponse) => {
        const dispatch = composer(true, ...handlers)
        const context: Context = {
            req
            , res
            , next: null
            , error: null
            , errorHandler
        }

        dispatch(context)
    }
}

export const listen = (handler: RequestListener, port: number): Promise<http.Server> => new Promise((resolve, reject) => {
    const server = http.createServer(handler)
    server.on('listening', resolve)
    server.on('error', reject)
    server.listen(port)
    return server
})

export default run
