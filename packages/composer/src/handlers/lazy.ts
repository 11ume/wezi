import * as send from 'wezi-send'
import { Context, Handler, ErrorHandler } from 'wezi-types'
import { InternalError, createError } from 'wezi-error'
import { isPromise, isProduction } from './utils'

const reply = (context: Context, value: unknown): void => {
    if (value === null) {
        send.empty(context, 204)
        return
    }

    if (value !== undefined) {
        send.send(context, context.res.statusCode, value)
    }
}

const replyPromise = (context: Context, value: Promise<unknown>): Promise<void> => value
    .then((val: unknown) => reply(context, val))
    .catch(context.panic)

export const errorHandler = (context: Context, error: Partial<InternalError>): void => {
    const status = error.statusCode ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }

    if (isProduction()) {
        send.empty(context, status)
        return
    }

    send.json(context, payload, status)
}

export const endHandler = (context: Context, handler: ErrorHandler): void => {
    const err = createError(404)
    handler(context, err)
}

export const executeHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>): void => {
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
