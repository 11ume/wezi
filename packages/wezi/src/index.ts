import http, { IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { body } from 'wezi-receive'
import { actions } from 'wezi-actions'
import { shareable } from 'wezi-shared'
import { InternalError } from 'wezi-error'
import {
    Context
    , Handler
    , Status
} from 'wezi-types'
import * as send from 'wezi-send'
import { isProduction } from './utils'
interface WeziOptions<S> {
    readonly errorHandler?: Handler
    readonly initialShared?: S
}

type Wezi<S = any> = (options: WeziOptions<S>) => (req: IncomingMessage, res: ServerResponse) => void

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

const createContext = (req: IncomingMessage
    , res: ServerResponse
    , shared: unknown): Context => {
    return {
        req
        , res
        , shared
        , query: {}
        , params: {}
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

const wezi = <S = any>(...handlers: Handler[]) => (options: WeziOptions<S> = {}) => {
    const { initialShared = null, errorHandler = defaultErrorHandler } = options
    const shared = initialShared ?? {}
    shareable.errorHandler ??= errorHandler
    return (req: IncomingMessage, res: ServerResponse) => {
        const dispatch = composer(true, ...handlers)
        const context = createContext(req, res, shared)
        const enhancedContext = createEnhancedContext(context)
        dispatch(enhancedContext)
    }
}

export const listen = <S = any>(w: Wezi<S>, port: number, options?: WeziOptions<S>) => {
    const handler = w(options)
    const server = http.createServer((req, res) => handler(req, res))
    server.listen(port)
    return server
}

export default wezi
