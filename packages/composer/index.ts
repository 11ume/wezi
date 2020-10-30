import { Context, Handler, NextFunction } from 'wuok-types'
import { HttpError } from 'wuok-error'
import { send } from 'wuok-send'

type Dispatch = (ctx: Context, next?: NextFunction) => void

// execute and manage the return of a handler
const execute = async (ctx: Context, next: NextFunction, handler: Handler) => {
    try {
        const val = await handler(ctx, next)
        if (val) {
            send(ctx, ctx.res.statusCode, val)
            return
        }
    }
    catch (err) {
        next(err)
    }
}

// create a function "next" used fo pass to next handler in the handler stack
const createNext = (ctx: Context, dispatch: Dispatch) => {
    return function next(err?: HttpError) {
        if (err instanceof Error) ctx.error = err
        dispatch(ctx, next)
    }
}

// end response if all higher-order handlers are executed, and none of them have ended the response
const end = (main: boolean, ctx: Context) => main && ctx.res.end()

// used for create a multi handler flow controllers 
const composer = (main: boolean, ...handlers: Handler[]) => {
    let i = 0
    return function dispatch(ctx: Context, next: NextFunction = null) {
        if (ctx.res.writableEnded) return
        if (ctx.error) {
            ctx.errorHandler(ctx, next)
            return
        }
        if (i < handlers.length) {
            const handler = handlers[i++]
            const nx = next ?? createNext(ctx, dispatch)
            setImmediate(execute, ctx, nx, handler)
            return
        }

        end(main, ctx)
    }
}

export default composer