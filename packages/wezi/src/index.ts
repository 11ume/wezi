import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { Context, Handler } from 'wezi-types'
import { InternalError } from 'wezi-error'
import { createReceive } from 'wezi-receive'
import { createSend } from 'wezi-send'
import { createActions } from 'wezi-actions'
import { isProd } from './utils'

const defaultErrorHandler = ({ send }: Context, error: InternalError) => {
    const status = error.statusCode ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }
    if (isProd()) {
        send.empty(status)
        return
    }
    send.json(status, payload)
}

const createContext = (req: IncomingMessage
    , res: ServerResponse
    , errorHandler: Handler): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
        , send: null
        , receive: null
        , actions: null
        , errorHandler
    }
}

const createEnhancedContext = (context: Context): Context => {
    return {
        ...context
        , send: createSend(context)
        , receive: createReceive(context)
        , actions: createActions(context)
    }
}

const run = (...handlers: Handler[]) => (errorHandler: Handler = defaultErrorHandler) => {
    return (req: IncomingMessage, res: ServerResponse) => {
        const dispatch = composer(true, ...handlers)
        const context = createContext(req, res, errorHandler)
        const enhancedContext = createEnhancedContext(context)
        dispatch(enhancedContext)
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
