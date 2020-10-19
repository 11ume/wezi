import { IncomingMessage, ServerResponse } from 'http'
import { mergeHandlers } from 'utils'
import { ErrorObj } from 'error'
import { send } from 'senders'

export interface Context {
    req: IncomingMessage
    , res: ServerResponse
    , error?: ErrorObj
}

export type NextFunction = (err?: ErrorObj) => void
export type RequestListener = (ctx: Context, next?: NextFunction) => void
type Loop = (ctx: Context) => void

// asnyc handler executor sandbox
function handleAsyncReturn(ctx: Context, next: NextFunction) {
    return (val: unknown) => {
        if (ctx.error) return
        if (val === null) {
            send(ctx, 204)
            return
        }

        if (val !== undefined) {
            send(ctx, ctx.res.statusCode, val)
            return
        }

        next()
    }
}

// controll the async flow of all handlers
function asyncHandlerWrapper(ctx: Context, next: NextFunction, handler: RequestListener) {
    return new Promise(resolve => resolve(handler(ctx, next)))
        .then(handleAsyncReturn(ctx, next))
        .catch(next)
}

// is used for pass to next handler in the loop
function nextCreator(ctx: Context, loop: Loop) {
    return function next(err?: ErrorObj) {
        if (err) ctx.error = err
        loop(ctx)
    }
}

// works whit handler pile and the loop logic
function loopCreator(handlers: RequestListener[]) {
    let i = 0
    return function loop(ctx: Context) {
        if (ctx.error) i = handlers.length - 1 // go to last handler
        if (ctx.res.writableEnded) return
        if (i < handlers.length) {
            const handler = handlers[i++]
            const next = nextCreator(ctx, loop)
            asyncHandlerWrapper(ctx, next, handler)
        }
    }
}

const createApp = (handler: RequestListener | RequestListener[], ...handlers: RequestListener[]) => {
    const mergedHandlers = mergeHandlers(handler, handlers)
    return (req: IncomingMessage, res: ServerResponse) => {
        loopCreator(mergedHandlers)({
            req
            , res
        })
    }
}
export default createApp
