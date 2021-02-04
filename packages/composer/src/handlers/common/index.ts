import * as send from 'wezi-send'
import { Context, ErrorHandler } from 'wezi-types'
import { InternalError, createError } from 'wezi-error'
import { isProduction } from './utils'

export const errorHandler = (context: Context, error: Partial<InternalError>): void => {
    const status = error.code ?? 500
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
