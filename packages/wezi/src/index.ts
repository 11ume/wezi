import http, { Server, IncomingMessage, ServerResponse, RequestListener } from 'http'
import {
    Context
    , Handler
    , ComposerHandler
    , HandlerMuti
    , ErrorHandler
} from 'wezi-types'
import {
    PreparedComposer
    , lazyComposer
    , $composer
} from 'wezi-composer'

type Wezi = (...handlers: (ComposerHandler | Handler)[]) => (errorHandler?: ErrorHandler) => RequestListener

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
    }
}

const composeHandlers = (preparedComposer: PreparedComposer, handlers: HandlerMuti[]) => handlers.map((handler) => {
    if (handler.id === $composer) return handler(preparedComposer)
    return handler
})

export const listen = (listener: RequestListener, port = 3000): Server => {
    const server = http.createServer(listener)
    server.listen(port)
    return server
}

export const wezi: Wezi = (...handlers: any[]) => (errorHandler?: ErrorHandler): RequestListener => {
    const preparedComposer = lazyComposer(errorHandler)
    const composedHandlers = composeHandlers(preparedComposer, handlers)
    return (req: IncomingMessage, res: ServerResponse): void => {
        const dispatch = preparedComposer(true, ...composedHandlers)
        dispatch(createContext(req, res))
    }
}
