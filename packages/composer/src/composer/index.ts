import { createError } from 'wezi-error'
import { defaultErrorHandler } from './handlers'
import {
    Next
    , Panic
    , Context
    , Handler
    , Dispatch
} from 'wezi-types'

export type Composer = (errorHandlerCustom: ErrorHandler) => (main: boolean, ...handlers: Handler[]) => Dispatch
export type PrepareComposer = (main: boolean, ...handlers: Handler[]) => Dispatch
export type EndHandler = (context: Context, errorHandler: ErrorHandler) => void
export type ErrorHandler = (context: Context, error: Error) => void
export type ErrorHandlerPatch = (context: Context, error: Error, errorHandler: ErrorHandler) => void
export type ExecuteHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>) => void

const patchErrorHandler = (errorHandler: ErrorHandlerPatch, customErrorHandler: ErrorHandler) => (context: Context, error: Error) => {
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

export const createComposer = (errorHandler: ErrorHandlerPatch, endHandler: EndHandler, executeHandler: ExecuteHandler) =>
    (customErrorHandler: ErrorHandler = defaultErrorHandler) => (main: boolean, ...handlers: Handler[]): Dispatch => {
        const errHandler = errorHandler ? patchErrorHandler(errorHandler, customErrorHandler) : customErrorHandler
        let inc = 0

        return function dispatch(context: Context, payload?: unknown): void {
            if (inc < handlers.length) {
                const handler = handlers[inc++]
                const newContext = createContext(context, dispatch, errHandler)
                setImmediate(executeHandler, newContext, handler, payload)
                return
            }

            main && setImmediate(endHandler, context, errHandler)
        }
    }
