import http, { Server, IncomingMessage, ServerResponse } from 'http'
import { Context, Handler, ComposerHandler, ComposerHandlerMix } from 'wezi-types'
import {
    Composer
    , Prepare
    , ErrorHandler
    , lazyComposer
    , $composer
} from 'wezi-composer'

type ComposeHandlers = (composer: Composer) => (req: IncomingMessage, res: ServerResponse) => void

type ListenOptions = {
    port?: number
    , composer?: Composer
}

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
    }
}

const composeHandlers = (prepare: Prepare, handlers: ComposerHandlerMix[]) => handlers.map((handler) => {
    if (handler.id === $composer) return handler(prepare)
    return handler
})

export const listen = (compose: ComposeHandlers, { port = 3000, composer }: ListenOptions = {}): Server => {
    const run = composer ? compose(composer) : compose(lazyComposer)
    const server = http.createServer(run)
    server.listen(port)
    return server
}

export function wezi(errorHandler: ErrorHandler, ...handlers: (ComposerHandler | Handler)[]): ComposeHandlers
export function wezi(errorHandler: ErrorHandler, ...handlers: any[]): ComposeHandlers {
    return (composer: Composer) => {
        const prepare = composer(errorHandler)
        const composedHandlers = composeHandlers(prepare, handlers)
        return (req: IncomingMessage, res: ServerResponse): void => {
            const dispatch = prepare(true, ...composedHandlers)
            dispatch(createContext(req, res))
        }
    }
}
