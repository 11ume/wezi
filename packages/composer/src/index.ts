import { send, empty, json } from 'wezi-send'
import { createError, InternalError } from 'wezi-error'
import {
    Context
    , Dispatch
    , Handler
    , Next
    , Panic
} from 'wezi-types'
import { createContext, isProduction, isPromise } from './utils'

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
    const err = createError(404)
    errorHandler(context, err)
}

const reply = (context: Context, value: unknown) => {
    if (value === null) {
        send(context, 204, value)
        return
    }

    if (value !== undefined) {
        send(context, context.res.statusCode, value)
    }
}

const executeHandler = (context: Context, handler: Handler, payload: unknown) => {
    try {
        const value = handler(context, payload)
        if (isPromise(value)) {
            value
                .then((val: unknown) => reply(context, val))
                .catch(context.panic)
            return
        }

        reply(context, value)
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

export const composer = (main: boolean, ...handlers: Handler[]): Dispatch => {
    const len = handlers.length
    let inc = 0
    return function dispatch(context: Context, payload?: unknown): void {
        if (inc < len) {
            const handler = handlers[inc++]
            const newContext = createContext(context, {
                next: createNext(context, dispatch)
                , panic: createPanic(context)
            })

            setImmediate(executeHandler, newContext, handler, payload)
            return
        }

        main && setImmediate(endHandler, context)
    }
}

export const composerSingleHandler = (handler: Handler): Dispatch => {
    return function dispatch(context: Context, payload?: unknown): void {
        const newContext = createContext(context, {
            next: createNext(context, dispatch)
            , panic: createPanic(context)
        })

        setImmediate(executeHandler, newContext, handler, payload)
    }
}
