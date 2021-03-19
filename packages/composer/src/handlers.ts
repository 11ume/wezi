import { InternalError, createError } from 'wezi-error'
import { Context, Handler, ErrorHandler } from 'wezi-types'
import { json } from 'wezi-send'
import { isPromise } from './utils'

export const errorHandler = (context: Context, error: Partial<InternalError>): void => {
    const status = error.statusCode ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }

    json(context, payload, status)
}

export const executeHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>): void => {
    try {
        const value: Partial<Promise<unknown>> = handler(context, payload)
        if (value && isPromise(value)) value.catch(context.panic)
    } catch (err) {
        context.panic(err)
    }
}

export const endHandler = (context: Context, handler: ErrorHandler): void => {
    const err = createError(404, 'Not Found')
    handler(context, err)
}
