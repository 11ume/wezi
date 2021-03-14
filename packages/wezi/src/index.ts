import http, { Server, IncomingMessage, ServerResponse, RequestListener } from 'http'
import { Context, Handler, ErrorHandler, ComposerHandler } from 'wezi-types'
import { composer, prepareComposerHandlers } from 'wezi-composer'

export type Wezi = (...handlers: (Handler | ComposerHandler)[]) => (errorHandler?: ErrorHandler) => RequestListener

export const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
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
    const prepareComposer = composer(errorHandler)
    const composedHandlers = prepareComposerHandlers(prepareComposer, handlers)
    const run = prepareComposer(true, ...composedHandlers)
    return (req: IncomingMessage, res: ServerResponse): void => run(createContext(req, res))
}
