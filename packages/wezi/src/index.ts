import http, { Server, IncomingMessage, ServerResponse } from 'http'
import { Context, Handler, ComposerHandler, ComposerHandlerMix } from 'wezi-types'
import {
    Composer
    , ComposerCreator
    , ErrorHandler
    , lazyComposer
    , $composer
} from 'wezi-composer'

type ComposeHandlers = (composer: Composer) => (req: IncomingMessage, res: ServerResponse) => void

type ListenOptions = {
    port?: number
    , composer?: ComposerCreator
    , errorHandler?: ErrorHandler
}

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

export const listen = (compose: ComposeHandlers, { port = 3000, composer, errorHandler }: ListenOptions = {}): Server => {
    const run = composer ? compose(composer(errorHandler)) : compose(lazyComposer(errorHandler))
    const server = http.createServer(run)
    server.listen(port)
    return server
}

export function wezi(...handlers: (ComposerHandler | Handler)[]): ComposeHandlers
export function wezi(...handlers: any[]): ComposeHandlers {
    return (composer: Composer) => {
        const composedHandlers = composeHandlers(composer, handlers)
        return (req: IncomingMessage, res: ServerResponse): void => {
            const dispatch = composer(true, ...composedHandlers)
            dispatch(createContext(req, res))
        }
    }
}
