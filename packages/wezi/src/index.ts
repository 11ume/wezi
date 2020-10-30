import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import { Context, Handler } from 'wezi-types'
import { mergeHandlers } from './utils'
import composer from 'wezi-composer'

export const errorHandler = (ctx: Context) => {
    ctx.res.statusCode = ctx.error.statusCode || 500
    ctx.res.end()
}

export const listen = (run: RequestListener, port: number) => new Promise((resolve, reject) => {
    const server = http.createServer(run)
    server.on('listening', resolve)
    server.on('error', reject)
    return server.listen(port)
})

const run = (handler: Handler | Handler[], ...handlers: Handler[]) => (errHandler: Handler = errorHandler) => {
    const mergedHandlers = mergeHandlers(handler, handlers)
    return (req: IncomingMessage, res: ServerResponse) => {
        const dispatch = composer(true, ...mergedHandlers)
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