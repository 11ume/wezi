import { IncomingMessage, ServerResponse } from 'http'
import { send, sendError } from 'senders'

export interface Context {
    req: IncomingMessage
    , res: ServerResponse
    , error?: Error
}

export type NextFunction = (err?: Error) => void
export type RequestListener = (ctx: Context, next?: NextFunction) => void
type Loop = (req: IncomingMessage, res: ServerResponse) => void

function asyncHandler(ctx: Context, next: NextFunction, handler: RequestListener) {
    return new Promise(resolve => resolve(handler(ctx, next)))
        .then((val: unknown) => {
            if (val === null) {
                send(ctx.res, 204)
                return
            }

            if (val !== undefined) {
                send(ctx.res, ctx.res.statusCode, val)
            }
        })
        .catch(err => {
            sendError(ctx.res, err)
        })
}

function nextFn(ctx: Context, loop: Loop) {
    return function next(err?: Error) {
        if (err) return
        loop(ctx.req, ctx.res)
    }
}

function loopFn(handlers: RequestListener[]) {
    let i = 0
    return function loop(req: IncomingMessage, res: ServerResponse) {
        if (res.writableEnded) return
        if (i < handlers.length) {
            const ctx = {
                res, req
            }
            const handler = handlers[i++]
            const next = nextFn(ctx, loop)
            asyncHandler(ctx, next, handler)
        }
    }
}

const createApp = (handlers: RequestListener[]) => (req: IncomingMessage, res: ServerResponse) => loopFn(handlers)(null, req, res)
export default createApp
