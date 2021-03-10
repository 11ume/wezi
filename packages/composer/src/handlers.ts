import * as send from 'wezi-send'
import { InternalError, createError } from 'wezi-error'
import { isPromise } from './utils'
import {
    Context
    , Handler
    , ErrorHandler
} from 'wezi-types'

export const errorHandler = (context: Context, error: Partial<InternalError>): void => {
    const status = error.statusCode ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }

    send.json(context, payload, status)
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
    const err = createError(404)
    handler(context, err)
}
