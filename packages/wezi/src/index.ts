import http, { Server, IncomingMessage, ServerResponse } from 'http'
import { Context, Handler, ComposerHandler, ComposerHandlerMix } from 'wezi-types'
import {
    Composer
    , PrepareComposer
    , ErrorHandler
    , lazyComposer
    , $composer
} from 'wezi-composer'

type ListenOptions = {
    port?: number
    , composer?: Composer
}

type WeziCompose = (composer: Composer) => (req: IncomingMessage, res: ServerResponse) => void

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
    }
}

const composeHandlers = (prepare: PrepareComposer, handlers: ComposerHandlerMix[]) => handlers.map((handler) => {
    if (handler.id === $composer) return handler(prepare)
    return handler
})

export const listen = (weziCompose: WeziCompose, { port = 3000, composer }: ListenOptions = {}): Server => {
    const run = composer ? weziCompose(composer) : weziCompose(lazyComposer)
    const server = http.createServer(run)
    server.listen(port)
    return server
}

export function wezi(errorHandler: ErrorHandler, ...handlers: (ComposerHandler | Handler)[]): WeziCompose
export function wezi(errorHandler: ErrorHandler, ...handlers: any[]): WeziCompose {
    return (composer: Composer) => {
        const prepare = composer(errorHandler)
        const composedHandlers = composeHandlers(prepare, handlers)
        return (req: IncomingMessage, res: ServerResponse): void => {
            const dispatch = prepare(true, ...composedHandlers)
            dispatch(createContext(req, res))
        }
    }
}
