import * as send from 'wezi-send'
import { createError, InternalError } from 'wezi-error'
import {
    Next
    , Panic
    , Context
    , Handler
    , Dispatch
} from 'wezi-types'
import { isPromise, isProduction } from './utils'

const errorHandler = (context: Context, error: InternalError) => {
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

const endHandler = (context: Context) => {
    const err = createError(404)
    errorHandler(context, err)
}

const reply = (context: Context, value: unknown) => {
    if (value === null) {
        send.empty(context, 204)
        return
    }

    if (value !== undefined) {
        send.send(context, context.res.statusCode, value)
    }
}

const replyPromise = (context: Context, value: Promise<unknown>) => value
    .then((val: unknown) => reply(context, val))
    .catch(context.panic)

const executeHandler = (context: Context, handler: Handler, payload: unknown): void => {
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

const createContext = (context: Context, dispatch: Dispatch) => {
    return Object.assign(context, {
        next: createNext(context, dispatch)
        , panic: createPanic(context)
    })
}

export const composer = (main: boolean, ...handlers: Handler[]): Dispatch => {
    const len = handlers.length
    let inc = 0
    return function dispatch(context: Context, payload?: unknown): void {
        if (inc < len) {
            const handler = handlers[inc++]
            const newContext = createContext(context, dispatch)
            setImmediate(executeHandler, newContext, handler, payload)
            return
        }

        main && setImmediate(endHandler, context)
    }
}

export const composerSingleHandler = (handler: Handler): Dispatch => {
    return function dispatch(context: Context, payload?: unknown): void {
        const newContext = createContext(context, dispatch)
        setImmediate(executeHandler, newContext, handler, payload)
    }
}
