import { IncomingMessage, ServerResponse } from 'http'
import { mergeHandlers } from './src/utils'
import { Context, Handler } from 'wuok-types'
import composer from 'wuok-composer'

// default error handler
export const errorHandler = (ctx: Context) => {
    ctx.res.statusCode = ctx.error.statusCode || 500
    ctx.res.end()
}

export const serve = (handler: Handler | Handler[], ...handlers: Handler[]) => (errHandler: Handler = errorHandler) => {
    const mergedHandlers = mergeHandlers(handler, handlers)
    return (req: IncomingMessage, res: ServerResponse) => {
        const loop = composer(mergedHandlers, errHandler)
        const context = {
            req
            , res
            , error: null
        }

        loop(context)
    }
}