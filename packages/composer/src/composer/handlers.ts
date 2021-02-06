import * as send from 'wezi-send'
import { Context, Handler } from 'wezi-types'
import { InternalError, createError } from 'wezi-error'
import { ErrorHandler } from '.'
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

export const defaultErrorHandler = (context: Context, error: Partial<InternalError>): void => {
    const status = error.code ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }

    send.json(context, payload, status)
}

export const defaultEndHandler = (context: Context, handleError: ErrorHandler): void => {
    const err = createError(404)
    handleError(context, err)
}
