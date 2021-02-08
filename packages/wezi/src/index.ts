import http, { Server, IncomingMessage, ServerResponse } from 'http'
import { Context, Handler, ComposerHandler, Handlers } from 'wezi-types'
import {
    Composer
    , PrepareComposer
    , ErrorHandler
    , lazyComposer
    , noLazyComposer
    , $composer
} from 'wezi-composer'

type ListenOptions = {
    port?: number
    , lazy?: boolean
    , composer?: Composer
}

type WeziPrepare = (errorHandler?: ErrorHandler) => (composer: Composer) => (req: IncomingMessage, res: ServerResponse) => void
type WeziCompose = (composer: Composer) => (req: IncomingMessage, res: ServerResponse) => void

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
    }
}

const composeHandlers = (prepare: PrepareComposer, handlers: Handlers[]) => handlers.map((handler) => {
    if (handler.id === $composer) return handler(prepare)
    return handler
})

export const listen = (weziCompose: WeziCompose, { port = 3000, lazy = true, composer }: ListenOptions = {}): Server => {
    const run = composer ? weziCompose(composer) : weziCompose(lazy ? lazyComposer : noLazyComposer)
    const server = http.createServer(run)
    server.listen(port)
    return server
}

export function wezi(...handlers: (ComposerHandler | Handler)[]): WeziPrepare
export function wezi(...handlers: any[]): WeziPrepare {
    return (errorHandler?: ErrorHandler) => (composer: Composer) => {
        const prepare = composer(errorHandler)
        const composedHandlers = composeHandlers(prepare, handlers)
        return (req: IncomingMessage, res: ServerResponse): void => {
            const dispatch = prepare(true, ...composedHandlers)
            dispatch(createContext(req, res))
        }
    }
}
