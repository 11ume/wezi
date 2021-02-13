import { createError } from 'wezi-error'
import { defaultErrorHandler } from './handlers'
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
export type ErrorHandlerProxy = (context: Context, error: Error, errorHandler: ErrorHandler) => void
export type ExecuteHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>) => void

const makeErrorHandlerProxy = (errorHandler: ErrorHandlerProxy, customErrorHandler: ErrorHandler) => (context: Context, error: Error) => {
    errorHandler(context, error, customErrorHandler)
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

export const createComposer = (errorHandlerProxy: ErrorHandlerProxy, endHandler: EndHandler, executeHandler: ExecuteHandler) =>
    (customErrorHandler: ErrorHandler = defaultErrorHandler): PreparedComposer => {
        const errorHandler = errorHandlerProxy ? makeErrorHandlerProxy(errorHandlerProxy, customErrorHandler) : customErrorHandler
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
