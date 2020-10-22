import { IncomingMessage, ServerResponse } from 'http'
import { mergeHandlers } from './utils'
import { ErrorObj } from './error'
import { send } from './senders'

export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    error?: ErrorObj
}

export type NextFunction = (err?: ErrorObj) => void
export type RequestListener = (ctx: Context, next?: NextFunction) => unknown
type Loop = (ctx: Context) => void

// sandbox of asnyc handlers execution
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

// is used for pass to next function in each handler of the loop
function createNextFn(ctx: Context, loop: Loop) {
    return function next(err?: ErrorObj) {
        if (err) ctx.error = err
        loop(ctx)
    }
}

// control the handler loop pile
function createLoop(handlers: RequestListener[]) {
    let i = 0
    return function loop(ctx: Context) {
        // on error, go to last handler
        if (ctx.error) i = handlers.length - 1
        if (ctx.res.writableEnded) return
        if (i < handlers.length) {
            const handler = handlers[i++]
            const next = createNextFn(ctx, loop)
            asyncHandlerWrapper(ctx, next, handler)
        }
    }
}

// create app whit middlewares
export const createApp = (handler: RequestListener | RequestListener[], ...handlers: RequestListener[]) => {
    const mergedHandlers = mergeHandlers(handler, handlers)
    return (req: IncomingMessage, res: ServerResponse) => {
        const runLoop = createLoop(mergedHandlers)
        const context = {
            req
            , res
        }

        runLoop(context)
    }
}