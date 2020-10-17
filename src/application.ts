import { IncomingMessage, ServerResponse } from 'http'
import { send, sendError } from 'senders'

export type NextFunction = (err?: Error) => void
export type RequestListener = (req: IncomingMessage, res: ServerResponse, next?: NextFunction) => unknown

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
    , middlewares: RequestListener[]) {
    return (err?: Error) => {
        if (err) return
        loop(req, res, middlewares)
    }
}

function loop(req: IncomingMessage
    , res: ServerResponse
    , middlewares: RequestListener[]) {
    let i = 0
    if (res.writableEnded) return
    if (i < middlewares.length) {
        const handler = middlewares[i++]
        const next = nextFn(req, res, middlewares)
        requestListener(req, res, next, handler)
    }
}

export const createApp = (middlewares: RequestListener[]) => {
    return (req: IncomingMessage, res: ServerResponse) => {
        loop(req, res, middlewares)
    }
}
