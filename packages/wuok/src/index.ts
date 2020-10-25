import { IncomingMessage, ServerResponse } from 'http'
import { mergeHandlers } from './utils'
import { ErrorObj } from './error'
import { send } from 'wuok-send'

export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    error?: ErrorObj
}

export type NextFunction = (err?: ErrorObj) => void
export type Handler = (ctx: Context, next?: NextFunction) => any

type Loop = (ctx: Context, next?: NextFunction) => void

// used for controll the async execution of each handler in the stack
const exec = (ctx: Context, next: NextFunction, handler: Handler) => {
        // automatic handler response resolver 
        try {
            const val = handler(ctx, next)
            if (val) {
                send(ctx, ctx.res.statusCode, val)
                return
            }
            next()
        }
        catch(err) {
            next(err)
        }
}

// default error handler
const errorHandler = (ctx: Context) => {
    ctx.res.statusCode = ctx.error.statusCode || 500
    ctx.res.end()
}

// create a "next function" used for increase by one position in the stack of handlers
const createNextFn = (ctx: Context, loop: Loop) => {
    return function next(err?: ErrorObj) {
        if (err instanceof Error) ctx.error = err
        loop(ctx, next)
    }
}

function *run() {
    yield exec(ctx, nx, handler)
}

// creates a loop handler stack controller, used for execute each handler secuencially
export const createHandlersLoop = (handlers: Handler[], handleErrors: Handler = errorHandler): Loop => {
    let i = 0
    return function loop(ctx: Context, next: NextFunction = null) {
        if (ctx.error) {
            handleErrors(ctx, next)
            return
        }
        if (ctx.res.writableEnded) return
        if (i < handlers.length) {
            const handler = handlers[i++]
            const nx = next ?? createNextFn(ctx, loop)
            exec(ctx, nx, handler)
            return
        }

        // if none handler has end the response
        ctx.res.end()
    }
}

export const createApp = (handler: Handler | Handler[], ...handlers: Handler[]) => (errHandler?: Handler) => {
    const mergedHandlers = mergeHandlers(handler, handlers)
    return (req: IncomingMessage, res: ServerResponse) => {
        const loop = createHandlersLoop(mergedHandlers, errHandler)
        const context = {
            req
            , res
        }

        loop(context)
    }
}