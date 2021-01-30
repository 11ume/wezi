import http, { Server, IncomingMessage, ServerResponse } from 'http'
import { Context } from 'wezi-types'
import { Composer, $composer, lazy } from 'wezi-composer'

type Wezi = (composer: Composer) => (req: IncomingMessage, res: ServerResponse) => void
type Handler = (...args: any[]) => any

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
    }
}

const composeHandlers = (composer: Composer, handlers: Handler[]) => handlers.map((handler) => {
    if (handler.name === $composer) return handler(composer)
    return handler
})

export const wezi = (...handlersIn: Handler[]) => (composer: Composer) => {
    const handlers = composeHandlers(composer, handlersIn)
    return (req: IncomingMessage, res: ServerResponse): void => {
        const dispatch = composer(true, ...handlers)
        dispatch(createContext(req, res))
    }
}

export const listen = (handler: Wezi, port = 3000, listeningListener?: () => void): Server => {
    const server = http.createServer(handler(lazy))
    server.listen(port, listeningListener)
    return server
}

