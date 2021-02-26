import * as send from 'wezi-send'
import { Context, Handler, ErrorHandler } from 'wezi-types'
import { InternalError, createError } from 'wezi-error'
import { reply, replyPromise } from './reply'
import { isPromise } from './utils'

export const executeHandlerLazy = (context: Context, handler: Handler, payload: unknown | Promise<unknown>): void => {
    try {
        const value = handler(context, payload)
        if (value && isPromise(value)) {
            replyPromise(context, value)
            return
        }

        reply(context, value)
    } catch (err) {
        context.panic(err)
    }
}

export const errorHandler = (context: Context, error: Partial<InternalError>): void => {
    const status = error.code ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }

    send.json(context, payload, status)
}

export const endHandler = (context: Context, handleError: ErrorHandler): void => {
    const err = createError(404)
    handleError(context, err)
}
