import http, { Server, IncomingMessage, ServerResponse } from 'http'
import { Context, Handler, ComposerHandler, ComposerHandlerMix } from 'wezi-types'
import { Composer, $composer, lazy } from 'wezi-composer'

type Run = (composer: Composer) => (req: IncomingMessage, res: ServerResponse) => void

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
    }
}

const composeHandlers = (composer: Composer, handlers: ComposerHandlerMix[]) => handlers.map((handler) => {
    if (handler.id === $composer) return handler(composer)
    return handler
})

export function wezi(...handlers: (ComposerHandler | Handler)[]): Run
export function wezi(...handlers: any[]): Run {
    return (composer: Composer) => {
        const composedHandlers = composeHandlers(composer, handlers)
        return (req: IncomingMessage, res: ServerResponse): void => {
            const dispatch = composer(true, ...composedHandlers)
            dispatch(createContext(req, res))
        }
    }
}

export const listen = (run: Run, port = 3000, listeningListener?: () => void): Server => {
    const server = http.createServer(run(lazy))
    server.listen(port, listeningListener)
    return server
}

