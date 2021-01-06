import { send, empty, json } from 'wezi-send'
import { createError, InternalError } from 'wezi-error'
import {
    Context
    , Dispatch
    , Handler
    , Next
    , Panic
} from 'wezi-types'
import { createContext, isWritableEnded, isProduction } from './utils'

const errorHandler = (context: Context, error: InternalError) => {
    const status = error.statusCode ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }
    if (isProduction()) {
        empty(context, status)
        return
    }
    json(context, payload, status)
}

const endHandler = (context: Context) => {
    context.res.statusCode = 404
    context.res.end()
}

const executeHandler = async (context: Context, handler: Handler, payload: unknown): Promise<void> => {
    if (isWritableEnded(context)) return
    try {
        const val = await handler(context, payload)
        if (val === null) {
            send(context, 204, val)
            return
        }

        if (val !== undefined) {
            send(context, context.res.statusCode, val)
        }
    } catch (err) {
        context.panic(err)
    }
}

const createNext = (context: Context, dispatch: Dispatch): Next => {
    return function next(payload?: unknown): void {
        if (payload === undefined) {
            dispatch(context)
            return
        }

        dispatch(context, payload)
    }
}

const createPanic = (context: Context): Panic => {
    return function panic(error?: Error): void {
        if (error instanceof Error) {
            errorHandler(context, error)
            return
        }

        errorHandler(context, createError(500, 'panic error param, must be instance of Error'))
    }
}

export const composer = (main: boolean, ...handlers: Handler[]) => {
    let i = 0
    return function dispatch(context: Context, payload?: unknown): void {
        if (i < handlers.length) {
            const handler = handlers[i++]
            const next = createNext(context, dispatch)
            const panic = createPanic(context)
            const newContext = createContext(context, {
                next
                , panic
            })

            setImmediate(executeHandler, newContext, handler, payload)
            return
        }

        // end response if all higher-order handlers are executed, and none of them has ended the response.
        main && setImmediate(endHandler, context)
    }
}
