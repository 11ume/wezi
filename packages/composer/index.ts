import { Context, Handler, NextFunction } from 'wuok-types'
import { ErrorObj } from 'wuok-error'
import { send } from 'wuok-send'

type Dispatch = (ctx: Context, next?: NextFunction) => void

const execute = async (ctx: Context, next: NextFunction, handler: Handler) => {
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

const createNext = (ctx: Context, dispatch: Dispatch) => {
    return function next(err?: ErrorObj) {
        if (err instanceof Error) ctx.error = err
        dispatch(ctx, next)
    }
}

const composer = (handlers: Handler[]) => {
    let i = 0
    return function dispatch(ctx: Context, next: NextFunction = null) {
        if (ctx.error) {
            ctx.errorHandler(ctx, next)
            return
        }
        if (ctx.res.writableEnded) return
        if (i < handlers.length) {
            const handler = handlers[i++]
            const nx = next ?? createNext(ctx, dispatch)
            execute(ctx, nx, handler)
            return
        }

        i = 0
        // in case of none handler has ended the response
        // ctx.res.end()
    }
}

export default composer