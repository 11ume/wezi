import { IncomingMessage, ServerResponse } from 'http'
import { Context, Handler } from 'wuok-types'
import { mergeHandlers } from './utils'
import composer from 'wuok-composer'

// default error handler
export const errorHandler = (ctx: Context) => {
    ctx.res.statusCode = ctx.error.statusCode || 500
    ctx.res.end()
}

const run = (handler: Handler | Handler[], ...handlers: Handler[]) => (errHandler: Handler = errorHandler) => {
    const mergedHandlers = mergeHandlers(handler, handlers)
    return (req: IncomingMessage, res: ServerResponse) => {
        const dispatch = composer(mergedHandlers, true)
        const context = {
            req
            , res
            , error: null
            , errorHandler: errHandler
        }

        dispatch(context)
    }
}

export default run