import { IncomingMessage, ServerResponse } from 'http'
import { send, sendEmpty, sendError } from 'senders'

export type NextFunction = (err?: Error) => void
export type RequestListener = (req: IncomingMessage, res: ServerResponse, next?: NextFunction) => void
type Loop = (req: IncomingMessage, res: ServerResponse) => void

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

function nextFn(req: IncomingMessage, res: ServerResponse, loop: Loop) {
    return function next(err?: Error) {
        if (err) return
        loop(req, res)
    }
}

function loopFn(handlers: RequestListener[]) {
    let i = 0
    return function loop(req: IncomingMessage, res: ServerResponse) {
        if (res.writableEnded) return
        if (i < handlers.length) {
            const handler = handlers[i++]
            const next = nextFn(req, res, loop)
            asyncHandler(req, res, next, handler)
        }
    }
}

const createApp = (handlers: RequestListener[]) => (req: IncomingMessage, res: ServerResponse) => loopFn(handlers)(req, res)
export default createApp
