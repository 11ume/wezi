import { Server } from 'http'
import { WeziCompose, ListenOptions, listen as devListen } from 'wezi'
import { Context, Handler } from 'wezi-types'
import { createError, InternalError } from 'wezi-error'
import {
    ErrorHandler
    , createComposer
    , reply
    , replyPromise
} from 'wezi-composer'
import { logReply, logNext } from './log'

const isPromise = (value: Partial<Promise<unknown>>): boolean => typeof value.then === 'function'

const errorHandler = (context: Context, error: Partial<InternalError>, handler: ErrorHandler): void => {
    console.log(`fail ${error.code} ${context.req.method}`)
    console.log(error.stack)
    handler(context, error as Error)
}

const endHandler = (context: Context, handleError: ErrorHandler): void => {
    const err = createError(404)
    handleError(context, err)
}

const executeHandlerLazy = (context: Context, handler: Handler, payload: unknown | Promise<unknown>): void => {
    const next = context.next
    let isNext = true
    context.next = (...args: any[]) => {
        isNext = false
        logNext(context, new Date(), 0)
        next(...args)
    }

    try {
        const value = handler(context, payload)
        if (value && isPromise(value)) {
            replyPromise(context, value)
            return
        }

        reply(context, value)
        isNext && logReply(context, new Date(), 0)
    } catch (err) {
        context.panic(err)
    }
}

export const listen = (weziCompose: WeziCompose, options?: ListenOptions): Server => {
    const composer = createComposer(errorHandler, endHandler, executeHandlerLazy)
    const server = devListen(weziCompose, {
        port: options?.port
        , composer
    })

    return server
}
