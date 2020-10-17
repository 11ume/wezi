import http, { IncomingMessage, ServerResponse } from 'http'
import { send, sendError } from 'senders'
import Trouter from 'trouter'

export type NextFunction = (err?: Error) => void
export type RequestListener = (req: IncomingMessage, res: ServerResponse, next?: NextFunction) => void

type Routes<T> = {
    keys: string[]
    , pattern: string
    , method: string
    , handlers: T
}

function requestListener(
    req: IncomingMessage
    , res: ServerResponse
    , next: NextFunction
    , handler: RequestListener) {
    return new Promise(resolve => resolve(handler(req, res, next)))
        .then((val: unknown) => {
            if (val === null) {
                send(res, 204, null)
                return
            }

            if (val !== undefined) {
                send(res, res.statusCode, val)
            }
        })
        .catch(err => {
            sendError(res, err)
        })
}

function nextFn(req: IncomingMessage
    , res: ServerResponse
    , routes: Routes<RequestListener>[]) {
    return (err?: Error) => {
        if (err) return
        loop(req, res, routes)
    }
}

function loop(req: IncomingMessage
    , res: ServerResponse
    , routes: Routes<RequestListener>[]) {
    let i = 0
    if (res.writableEnded) return
    if (i < routes.length) {
        const route = routes[i++]
        const next = nextFn(req, res, routes)
        const handler = route.handlers[0]
        requestListener(req, res, next, handler)
    }
}

export class App extends Trouter<RequestListener> {
    server: http.Server
    routes: Trouter.Routes<RequestListener>[]

    handler(req: IncomingMessage, res: ServerResponse) {
        loop(req, res, this.routes)
    }

    use(pattern: string | RegExp, ...handlers: RequestListener[]): this
    use(...handlers: RequestListener[]): this
    use(pattern: string | RegExp | RequestListener, ...handlers: RequestListener[]): this {
        if (pattern && handlers) { }
        return this
    }

    listen(port = 3000, callback?: (err?: Error) => void) {
        this.server = http.createServer(this.handler)
        this.server.listen(port, callback)
        return this
    }
}
