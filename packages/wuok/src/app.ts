import { IncomingMessage, ServerResponse } from 'http'
import { mergeHandlers } from './utils'
import { ErrorObj } from './error'
import { send, end } from './senders'

export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    error?: ErrorObj
}

export type NextFunction = (err?: ErrorObj) => void
export type RequestListener = (ctx: Context, next?: NextFunction) => any
type Loop = (ctx: Context, next: NextFunction) => void
type HandlerResponse = {
    context?: Context
    , handlers?: RequestListener[]
    , $handlers?: Symbol
}

// symbol used for detect an stack of handlers
export const $handlers = Symbol('handler_stack')

// sandbox of asnyc handlers execution
function handleAsyncReturn(ctx: Context, next: NextFunction, val: unknown) {
    if (val === null) {
        send(ctx, 204)
        return
    }
    if (val !== undefined) {
        send(ctx, ctx.res.statusCode, val)
        return
    }

    // go to next handler in empty returns
    next()
}

// controll the async flow of all handlers
async function asyncHandlerWrapper(ctx: Context
    , next: NextFunction
    , handler: RequestListener
    , errorHandler: RequestListener) {
        try {
            const ret: HandlerResponse = await handler(ctx, next)
            // any handler can return a stack of handlers
            if (ret?.$handlers) {
                const loop = createHandlersLoop(ret.handlers, errorHandler)
                loop(ret.context)
                return
            }

            handleAsyncReturn(ctx, next, ret)
        } catch(err) {
            next(err)
        }
}

// an "next function" is used for increase a one position in the stack of handlers
function createNextFn(ctx: Context, loop: Loop) {
    return function next(err?: ErrorObj) {
        if (err) ctx.error = err
        loop(ctx, next)
    }
}

// default error handler
function handlerErrors(ctx: Context) {
    ctx.res.statusCode = ctx.error.statusCode || 500
    end(ctx)
}

// creates a loop handler stack controller, used for execute each handler secuencially  
function createHandlersLoop(handlers: RequestListener[], errorHandler: RequestListener = handlerErrors) {
    let i = 0
    return function loop(ctx: Context, next: NextFunction = null) {
        if (ctx.error) {
            errorHandler(ctx, next)
            return
        }
        if (ctx.res.writableEnded) return
        if (i < handlers.length) {
            const handler = handlers[i++]
            const nx = next ?? createNextFn(ctx, loop)
            asyncHandlerWrapper(ctx, nx, handler, errorHandler)
            return
        }

        // if it reaches this point, it is because none of handlers has sent a response
        end(ctx)
    }
}

// create app whit middlewares
export const createApp = (handler: RequestListener | RequestListener[], ...handlers: RequestListener[]) => (errHandler?: RequestListener) => {
    const mergedHandlers = mergeHandlers(handler, handlers)
    return (req: IncomingMessage, res: ServerResponse) => {
        const runLoop = createHandlersLoop(mergedHandlers, errHandler)
        const context = {
            req
            , res
        }

        runLoop(context)
    }
}