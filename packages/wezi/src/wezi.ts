import http, { Server, IncomingMessage, ServerResponse, RequestListener } from 'http'
import { Context, Handler } from 'wezi-types'
import { Composer } from 'wezi-composer'
import { body } from 'wezi-receive'
import { actions } from 'wezi-actions'

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , next: null
        , panic: null
        , body: null
        , actions: null
    }
}

const createEnhancedContext = (context: Context): Context => {
    return {
        ...context
        , body: body(context)
        , actions: actions(context)
    }
}

export const createWezi = (composer: Composer) => (...handlers: Handler[]) => (req: IncomingMessage, res: ServerResponse): void => {
    const dispatch = composer(true, handlers)
    const context = createContext(req, res)
    const enhancedContext = createEnhancedContext(context)
    dispatch(enhancedContext)
}

export const listen = (handler: RequestListener, port = 3000, listeningListener?: () => void): Server => {
    const server = http.createServer(handler)
    server.listen(port, listeningListener)
    return server
}

