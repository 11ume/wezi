import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { body } from 'wezi-receive'
import { actions } from 'wezi-actions'
import { Context, Handler } from 'wezi-types'
import { shareable } from 'wezi-shared'
import { InternalError } from 'wezi-error'
import * as send from 'wezi-send'

const isProduction = () => process.env.NODE_ENV === 'production'

const defaultErrorHandler = (context: Context, error: InternalError) => {
    const status = error.statusCode ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }
    if (isProduction()) {
        send.empty(context, status)
        return
    }
    send.json(context, payload, status)
}

const status = (context: Context) => (code: number) => {
    context.res.statusCode = code
}

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , body: null
        , next: null
        , panic: null
        , status: null
        , actions: null
    }
}

const createEnhancedContext = (context: Context): Context => {
    return {
        ...context
        , body: body(context)
        , status: status(context)
        , actions: actions(context)
    }
}

const wezi = (...handlers: Handler[]) => {
    return (req: IncomingMessage, res: ServerResponse, errorHandler: Handler = defaultErrorHandler) => {
        const dispatch = composer(true, ...handlers)
        const context = createContext(req, res)
        const enhancedContext = createEnhancedContext(context)
        shareable.errorHandler = shareable.errorHandler ? errorHandler : errorHandler
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

export default wezi
