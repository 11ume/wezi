import http, { Server, IncomingMessage, ServerResponse, RequestListener } from 'http'
import { Context, Handler, ErrorHandler, ComposerHandler } from 'wezi-types'
import { composer, getComposerHandlers } from 'wezi-composer'

type Wezi = (...handlers: (Handler | ComposerHandler)[]) => (errorHandler?: ErrorHandler) => RequestListener

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
    }
}

export const listen = (listener: RequestListener, port = 3000, host?: string): Server => {
    const server = http.createServer(listener)
    server.listen(port, host)
    return server
}

export const wezi: Wezi = (...handlers: any[]) => (errorHandler?: ErrorHandler): RequestListener => {
    const preparedComposer = composer(errorHandler)
    const composedHandlers = getComposerHandlers(preparedComposer, handlers)
    return (req: IncomingMessage, res: ServerResponse): void => {
        const dispatch = preparedComposer(true, ...composedHandlers)
        dispatch(createContext(req, res))
    }
}
