import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { body } from 'wezi-receive'
import { actions } from 'wezi-actions'
import { shareable } from 'wezi-shared'
import { InternalError } from 'wezi-error'
import { Context, Handler, Status } from 'wezi-types'
import * as send from 'wezi-send'
import { isProduction } from './utils'

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

const status = (context: Context): Status => (code: number) => {
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
        shareable.errorHandler ??= errorHandler
        dispatch(enhancedContext)
    }
}

export const listen = (handler: RequestListener, port: number) => {
    const server = http.createServer((req, res) => handler(req, res))
    server.listen(port)
    return server
}

export default wezi
