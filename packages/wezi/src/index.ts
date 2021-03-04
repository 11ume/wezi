import http, { Server, IncomingMessage, ServerResponse, RequestListener } from 'http'
import {
    Context
    , Handler
    , HandlerMuti
    , ErrorHandler
    , ComposerHandler
} from 'wezi-types'
import {
    createComposer
    , PreparedComposer
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

export const listen = (listener: RequestListener, port = 3000, host?: string): Server => {
    const server = http.createServer(listener)
    server.listen(port, host)
    return server
}

export const wezi: Wezi = (...handlers: any[]) => (errorHandler?: ErrorHandler): RequestListener => {
    const preparedComposer = createComposer(errorHandler)
    const composedHandlers = composeHandlers(preparedComposer, handlers)
    return (req: IncomingMessage, res: ServerResponse): void => {
        const dispatch = preparedComposer(true, ...composedHandlers)
        dispatch(createContext(req, res))
    }
}
