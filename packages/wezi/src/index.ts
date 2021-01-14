import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { body } from 'wezi-receive'
import { shared } from 'wezi-shared'
import { actions } from 'wezi-actions'
import { Context, Handler, Status } from 'wezi-types'

const status = (context: Context): Status => (code: number, message?: string) => {
    context.res.statusCode = code
    if (message) {
        context.res.statusMessage = message
    }
}

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , body: null
        , next: null
        , panic: null
        , status: null
        , actions: null
        , shared: null
    }
}

const createEnhancedContext = (context: Context): Context => {
    return {
        ...context
        , body: body(context)
        , status: status(context)
        , shared: shared(context)
        , actions: actions(context)
    }
}

const wezi = (...handlers: Handler[]) => function run(req: IncomingMessage, res: ServerResponse) {
    const dispatch = composer(true, ...handlers)
    const context = createContext(req, res)
    const enhancedContext = createEnhancedContext(context)
    dispatch(enhancedContext)
}

export const listen = (handler: RequestListener, port = 3000, hostname: string = null) => {
    const server = http.createServer(handler)
    server.listen(port, hostname)
    return server
}

export default wezi
