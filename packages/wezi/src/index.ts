import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { Context, Handler } from 'wezi-types'
import { InteralError } from 'wezi-error'
import { send } from 'wezi-send'
import { isProd } from './utils'

const redirect = (context: Context, location: string) => {
    context.res.statusCode = 301
    context.res.setHeader('Location', location)
    context.res.end()
}

const defaultErrorHandler = (context: Context, error: InteralError) => {
    const status = error.statusCode || 500
    const message = error.message || 'unknown'
    if (isProd()) {
        send(context, status)
        return
    }
    send(context, status, {
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
            , panic: null
            , redirect
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
