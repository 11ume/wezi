import { IncomingMessage, ServerResponse } from 'http'
import { send, sendEmpty, sendError } from 'senders'

export type NextFunction = (err?: Error) => void
export type RequestListener = (req: IncomingMessage, res: ServerResponse, next?: NextFunction) => void

function asyncHandler(
    req: IncomingMessage
    , res: ServerResponse
    , next: NextFunction
    , handler: RequestListener) {
    return new Promise(resolve => resolve(handler(req, res, next)))
        .then((val: unknown) => {
            if (val === null) {
                sendEmpty(res, 204)
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
    , handlers: RequestListener | RequestListener[]) {
    return (err?: Error) => {
        if (err) return
        loop(req, res, handlers)
    }
}

function loop(req: IncomingMessage
    , res: ServerResponse
    , handlers: RequestListener | RequestListener[]) {
    let i = 0
    if (res.writableEnded) return
    if (i < handlers.length) {
        const handler = handlers[i++]
        const next = nextFn(req, res, handlers)
        asyncHandler(req, res, next, handler)
    }
}

const createApp = (handlers: RequestListener[]) => {
    return (req: IncomingMessage, res: ServerResponse) => {
        loop(req, res, handlers)
    }
}

export default createApp
