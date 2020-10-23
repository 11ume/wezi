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
export type Handler = (ctx: Context, next?: NextFunction) => any
type Loop = (ctx: Context, next: NextFunction) => void
type HandlerResponse = {
    context?: Context
    , handlers?: Handler[]
    , $handlers?: Symbol
}

// handler stack identifier
export const $handlers = Symbol('handler_stack')

// automatic handler response resolver 
const execReturnHandler = (ctx: Context, next: NextFunction, val: unknown) => {
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

// evaluate heandler execution result
const execEvaluator = (ctx: Context, next: NextFunction, errorHandler: Handler) => (value: HandlerResponse) => {
    if (value?.$handlers) {
        const loop = createHandlersLoop(value.handlers, errorHandler)
        loop(value.context)
        return
    }

    execReturnHandler(ctx, next, value)
}

// used for controll the async execution of each handler in the stack
const asyncHandlerWrapper = async (ctx: Context
    , next: NextFunction
    , handler: Handler
    , errorHandler: Handler) => new Promise((resolve: (value: HandlerResponse) => void) => resolve(handler(ctx, next)))
        .then(execEvaluator(ctx, next, errorHandler))
        .catch(next)

// create a "next function" used for increase by one position in the stack of handlers
const createNextFn = (ctx: Context, loop: Loop) => {
    return function next(err?: ErrorObj) {
        if (err) ctx.error = err
        loop(ctx, next)
    }
}

// default error handler
const handlerErrors = (ctx: Context) => {
    ctx.res.statusCode = ctx.error.statusCode || 500
    end(ctx)
}

// creates a loop handler stack controller, used for execute each handler secuencially
const createHandlersLoop = (handlers: Handler[], errorHandler: Handler = handlerErrors) => {
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

        end(ctx) // if any of all handlers do not returned any value
    }
}

export const createApp = (handler: Handler | Handler[], ...handlers: Handler[]) => (errHandler?: Handler) => {
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