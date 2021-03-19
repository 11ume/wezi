import http, { Server, IncomingMessage, ServerResponse, RequestListener } from 'http'
import { Context, Router, Handler, ErrorHandler } from 'wezi-types'
import { composer, composerMain } from 'wezi-composer'

export const createContext = (req: IncomingMessage, res: ServerResponse): Context => ({
    req
    , res
    , next: null
    , panic: null
})

export const listen = (listener: RequestListener, port = 3000, host?: string): Server => {
    const server = http.createServer(listener)
    server.listen(port, host)
    return server
}

export const wezi = (...handlers: Handler[]) => (router?: Router, errorHandler?: ErrorHandler): RequestListener => {
    const run = router ? composerMain(errorHandler, ...handlers, router(composer(errorHandler))) : composerMain(errorHandler, ...handlers)
    return (req: IncomingMessage, res: ServerResponse): void => run(createContext(req, res))
}
