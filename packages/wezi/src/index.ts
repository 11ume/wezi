import http, { Server, IncomingMessage, ServerResponse, RequestListener } from 'http'
import { Context, Handler } from 'wezi-types'
import { Composer } from 'wezi-composer'

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
    }
}

export const wezi = (...handlers: Handler[]) => (composer: Composer) => (req: IncomingMessage, res: ServerResponse): void => {
    const dispatch = composer(true, ...handlers)
    dispatch(createContext(req, res))
}

export const listen = (handler: RequestListener, port = 3000, listeningListener?: () => void): Server => {
    const server = http.createServer(handler)
    server.listen(port, listeningListener)
    return server
}

