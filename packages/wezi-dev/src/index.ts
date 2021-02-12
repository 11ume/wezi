import { WeziCompose, ListenOptions, listen as devListen } from 'wezi'
import { Context, Handler } from 'wezi-types'
import { createError, InternalError } from 'wezi-error'
import {
    ErrorHandler
    , createComposer
    , reply
    , replyPromise
} from 'wezi-composer'

const isPromise = (value: Partial<Promise<unknown>>): boolean => typeof value.then === 'function'

const errorHandler = (context: Context, error: Partial<InternalError>, handler: ErrorHandler): void => {
    console.error(error.code)
    console.error(error.message)
    handler(context, error as Error)
}

const endHandler = (context: Context, handleError: ErrorHandler): void => {
    const err = createError(404)
    handleError(context, err)
}

const executeHandlerLazy = (context: Context, handler: Handler, payload: unknown | Promise<unknown>): void => {
    try {
        const value = handler(context, payload)
        process.hrtime()
        console.log(`${context.req.method} ${handler.name}`)
        if (value && isPromise(value)) {
            replyPromise(context, value)
            return
        }

        reply(context, value)
    } catch (err) {
        context.panic(err)
    }
}

export const listen = (weziCompose: WeziCompose, options?: ListenOptions) => {
    const composer = createComposer(errorHandler, endHandler, executeHandlerLazy)
    return devListen(weziCompose, {
        port: options?.port
        , composer
    })
}
