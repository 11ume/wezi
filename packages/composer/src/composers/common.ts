import * as send from 'wezi-send'
import { Context, Handler } from 'wezi-types'
import { createError, InternalError } from 'wezi-error'
import { EndHandler, ErrorHandler, ExecuteHandler } from '../composer'
import { isProduction, isPromise } from '../utils'

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

export const endHandler: EndHandler = (context: Context, errHandler: ErrorHandler) => {
    const err = createError(404)
    errHandler(context, err)
}

export const errorHandler: ErrorHandler = (context: Context, error: Partial<InternalError>): void => {
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

export const executeHandler: ExecuteHandler = (context: Context, handler: Handler, payload: unknown): void => {
    try {
        const value = handler(context, payload)
        if (isPromise(value)) {
            replyPromise(context, value)
            return
        }

        reply(context, value)
    } catch (err) {
        context.panic(err)
    }
}
