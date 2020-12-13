import http, {
    Server
    , RequestListener
    , IncomingMessage
    , ServerResponse
} from 'http'
import composer from 'wezi-composer'
import { Context, Handler } from 'wezi-types'
import { InternalError } from 'wezi-error'
import { createSend } from 'wezi-send'
import { isProd } from './utils'

const redirect = (context: Context, location: string) => {
    context.res.statusCode = 301
    context.res.setHeader('Location', location)
    context.res.end()
}

const defaultErrorHandler = ({ send }: Context, error: InternalError) => {
    const status = error.statusCode || 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }
    if (isProd()) {
        send.empty(status)
        return
    }
    send.json(payload, status)
}

const createContext = (req: IncomingMessage
    , res: ServerResponse
    , errorHandler: Handler): Context => {
    return {
        req
        , res
        , send: null
        , next: null
        , panic: null
        , redirect: null
        , errorHandler
    }
}

const createEnhancedContext = (context: Context): Context => {
    return {
        ...context
        , redirect: (location: string) => redirect(context, location)
        , send: createSend(context)
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

export const listen = (handler: RequestListener, port: number): Promise<Server> => new Promise((resolve, reject) => {
    const server = http.createServer(handler)
    server.on('listening', resolve)
    server.on('error', reject)
    server.listen(port)
    return server
})

export default run
