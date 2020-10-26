import { Context, Handler, NextFunction } from 'wuok-types'
import { ErrorObj } from 'wuok-error'
import { send } from 'wuok-send'

type Loop = (ctx: Context, next?: NextFunction) => void

// create a "next function" used for increase by one position in the stack of handlers
const createNextFn = (ctx: Context, loop: Loop) => {
    return function next(err?: ErrorObj) {
        if (err instanceof Error) ctx.error = err
        loop(ctx, next)
    }
}

// used for controll the async execution of each handler in the stack
export const exec = async (ctx: Context, next: NextFunction, handler: Handler) => {
    // automatic handler response resolver 
    try {
        const val = await handler(ctx, next)
        if (val) {
            send(ctx, ctx.res.statusCode, val)
            return
        }
        next()
    }
    catch (err) {
        next(err)
    }
}

// creates a loop handler stack controller, used for execute each handler secuencially
export const composer = (handlers: Handler[], handleErrors: Handler): Loop => {
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

export default composer