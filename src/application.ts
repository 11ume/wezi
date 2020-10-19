import { IncomingMessage, ServerResponse } from 'http'
import { send, sendError } from 'senders'

export interface Context {
    req: IncomingMessage
    , res: ServerResponse
}

export type NextFunction = (err?: Error) => void
export type RequestListener = (ctx: Context, next?: NextFunction) => void
type Loop = (ctx: Context) => void

function asyncHandler(ctx: Context, next: NextFunction, handler: RequestListener) {
    return new Promise(resolve => resolve(handler(ctx, next)))
        .then((val: unknown) => {
            if (val === null) {
                send(ctx, 204)
                return
            }

            if (val !== undefined) {
                send(ctx, ctx.res.statusCode, val)
            }
        })
        .catch(err => {
            sendError(ctx, err)
        })
}

function nextFn(ctx: Context, loop: Loop) {
    return function next(err?: Error) {
        if (err) return
        loop(ctx)
    }
}

function loopFn(handlers: RequestListener[]) {
    let i = 0
    return function loop(ctx: Context) {
        if (ctx.res.writableEnded) return
        if (i < handlers.length) {
            const handler = handlers[i++]
            const next = nextFn(ctx, loop)
            asyncHandler(ctx, next, handler)
        }
    }
}

const createApp = (handler: RequestListener | RequestListener[], ...handlers: RequestListener[]) => {
    const mergeHandlers = Array.isArray(handler) ? [...handler, ...handlers] : [handler, ...handlers]
    return (req: IncomingMessage, res: ServerResponse) => {
        loopFn(mergeHandlers)({
            req
            , res
        })
    }
}
export default createApp
