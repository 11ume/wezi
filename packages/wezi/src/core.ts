import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { Context, Handler } from 'wezi-types'
import { send } from 'wezi-send'

type SafeShutdownHandler = (code: number) => void

const defaultErrorHandler = (ctx: Context) => {
    const status = ctx.error.statusCode || 500
    if (ctx.error.message) {
        send(ctx, status, {
            message: ctx.error.message
        })
        return
    }

    send(ctx, status)
}

const run = (...handlers: Handler[]) => (errorHandler: Handler = defaultErrorHandler) => {
    return (req: IncomingMessage, res: ServerResponse) => {
        const dispatch = composer(true, ...handlers)
        const context: Context = {
            req
            , res
            , next: null
            , error: null
            , errorHandler
        }

        dispatch(context)
    }
}

const safeShutdown = (fn: SafeShutdownHandler) => {
    process.on('exit', (code: number) => fn && fn(code))
    process.on('SIGINT', (_, code: number) => process.exit(code))
    process.on('SIGTERM', (_, code: number) => process.exit(code))
}

export const listen = (handler: RequestListener, port: number, shutdownHandler?: SafeShutdownHandler) => new Promise((resolve, reject) => {
    const server = http.createServer(handler)
    safeShutdown((code) => {
        server.close()
        shutdownHandler(code)
    })
    server.on('listening', resolve)
    server.on('error', reject)
    server.listen(port)
    return server
})

export default run
