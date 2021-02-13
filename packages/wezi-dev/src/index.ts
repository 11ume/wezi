import { Server } from 'http'
import { WeziCompose, ListenOptions, listen as devListen } from 'wezi'
import { Context, ErrorHandler } from 'wezi-types'
import { lazyComposer, noLazyComposer } from 'wezi-composer'
import { InternalError } from 'wezi-error'

const logger = (c: Context) => c.next()

const errrHandler = (customErrorHandler?: ErrorHandler) => (context: Context, error: Partial<InternalError>) => {
    console.log(error.stack)
    customErrorHandler && customErrorHandler(context, error as Error)
}

export const listen = (weziCompose: WeziCompose, options: ListenOptions = {}): Server => {
    const composer = options.lazy ? lazyComposer : noLazyComposer
    const patchComposer = (customErrorHandler?: ErrorHandler) => {
        return (main?: boolean, ...handlers: any[]) => {
            handlers.unshift(logger)
            const prepare = composer(errrHandler(customErrorHandler))
            return prepare(main, ...handlers)
        }
    }

    const server = devListen(weziCompose, {
        port: options.port
        , composer: patchComposer
    })

    return server
}

