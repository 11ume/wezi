import * as send from 'wezi-send'
import { InternalError, createError } from 'wezi-error'
import { isPromise } from './utils'
import {
    Next
    , Panic
    , Context
    , Handler
    , ErrorHandler
    , Dispatch
} from 'wezi-types'

export type Composer = (errorHandlerCustom: ErrorHandler) => (main: boolean, ...handlers: Handler[]) => Dispatch
export type PreparedComposer = (main: boolean, ...handlers: Handler[]) => Dispatch
export type EndHandler = (context: Context, errorHandler: ErrorHandler) => void
export type ExecuteHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>) => void

export const $composer = Symbol('composer')

const defaultErrorHandler = (context: Context, error: Partial<InternalError>): void => {
    const status = error.code ?? 500
    const message = error.message || 'unknown'
    const payload = {
        message
    }

    send.json(context, payload, status)
}

const executeHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>): void => {
    try {
        const value: Partial<Promise<unknown>> = handler(context, payload)
        if (value && isPromise(value)) value.catch(context.panic)
    } catch (err) {
        context.panic(err)
    }
}

const endHandler = (context: Context, errorHandler: ErrorHandler): void => {
    const err = createError(404)
    errorHandler(context, err)
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

const createPanic = (context: Context, errorHandler: ErrorHandler): Panic => {
    return function panic(error?: Error): void {
        if (error instanceof Error) {
            errorHandler(context, error)
            return
        }

        errorHandler(context, createError(500, 'panic error param, must be instance of Error'))
    }
}

const createContext = (context: Context, dispatch: Dispatch, errorHandler: ErrorHandler): Context => {
    return {
        ...context
        , next: createNext(context, dispatch)
        , panic: createPanic(context, errorHandler)
    }
}

export const createComposer = (errorHandler: ErrorHandler = defaultErrorHandler): PreparedComposer => {
    return (main: boolean, ...handlers: Handler[]): Dispatch => {
        let inc = 0
        return function dispatch(context: Context, payload?: unknown): void {
            if (inc < handlers.length) {
                const handler = handlers[inc++]
                const newContext = createContext(context, dispatch, errorHandler)
                setImmediate(executeHandler, newContext, handler, payload)
                return
            }

            main && setImmediate(endHandler, context, errorHandler)
        }
    }
}
