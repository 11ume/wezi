import http, { Server, IncomingMessage, ServerResponse } from 'http'
import { Context, Handler, ComposerHandler, ComposerHandlerMix } from 'wezi-types'
import { Composer, $composer, lazyComposer, noLazyComposer } from 'wezi-composer'

type Compose = (composer: Composer) => (req: IncomingMessage, res: ServerResponse) => void

type ListenOptions = {
    lazy?: boolean
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

const composeHandlers = (composer: Composer, handlers: ComposerHandlerMix[]) => handlers.map((handler) => {
    if (handler.id === $composer) return handler(composer)
    return handler
})

export function wezi(...handlers: (ComposerHandler | Handler)[]): Compose
export function wezi(...handlers: any[]): Compose {
    return (composer: Composer) => {
        const composedHandlers = composeHandlers(composer, handlers)
        return (req: IncomingMessage, res: ServerResponse): void => {
            const dispatch = composer(true, ...composedHandlers)
            dispatch(createContext(req, res))
        }
    }
}

export const listen = (compose: Compose, port = 3000, { lazy = true }: ListenOptions = {}): Server => {
    const run = lazy ? compose(lazyComposer) : compose(noLazyComposer)
    const server = http.createServer(run)
    server.listen(port)
    return server
}

