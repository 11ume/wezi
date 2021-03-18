import http, { Server, IncomingMessage, ServerResponse, RequestListener } from 'http'
import { Context, Handler, ErrorHandler, ComposerHandler } from 'wezi-types'
import { composer, composerMain, prepareComposerHandlers } from 'wezi-composer'

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
    const composedHandlers = prepareComposerHandlers(composer(errorHandler), handlers)
    const run = composerMain(errorHandler)(...composedHandlers)
    return (req: IncomingMessage, res: ServerResponse): void => run(createContext(req, res))
}
