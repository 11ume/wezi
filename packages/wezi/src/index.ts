import http, { Server, IncomingMessage, ServerResponse, RequestListener } from 'http'
import {
    Context
    , Handler
    , ComposerHandler
    , Handlers
    , ErrorHandler
} from 'wezi-types'
import {
    Composer
    , PreparedComposer
    , lazyComposer
    , noLazyComposer
    , $composer
} from 'wezi-composer'

export type WeziCompose = (composer: Composer) => RequestListener

export type ListenOptions = {
    port?: number
    , lazy?: boolean
    , composer?: Composer
}

type WeziPrepare = (errorHandler?: ErrorHandler) => (composer: Composer) => (req: IncomingMessage, res: ServerResponse) => void

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
    }
}

const composeHandlers = (preparedComposer: PreparedComposer, handlers: Handlers[]) => handlers.map((handler) => {
    if (handler.id === $composer) return handler(preparedComposer)
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
    return (errorHandler?: ErrorHandler) => (composer: Composer): RequestListener => {
        const preparedComposer = composer(errorHandler)
        const composedHandlers = composeHandlers(preparedComposer, handlers)
        return (req: IncomingMessage, res: ServerResponse): void => {
            const dispatch = preparedComposer(true, ...composedHandlers)
            dispatch(createContext(req, res))
        }
    }
}
