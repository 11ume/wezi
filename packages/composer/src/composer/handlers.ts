import * as send from 'wezi-send'
import { Context } from 'wezi-types'
import { InternalError, createError } from 'wezi-error'
import { ErrorHandler } from '.'

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
