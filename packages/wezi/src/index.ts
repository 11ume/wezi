import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { Context, Handler } from 'wezi-types'
import { HttpError } from 'wezi-error'
import { send } from 'wezi-send'
import { isProd } from './utils'

const defaultErrorHandler = (ctx: Context, error: Partial<HttpError>) => {
    const status = error.statusCode || 500
    const message = error.message || 'unknown'
    if (isProd()) {
        send(ctx, status)
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
            , shared: {}
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
