import { createError, InternalError } from 'wezi-error'
import {
    Next
    , Panic
    , Context
    , Handler
    , Dispatch
} from 'wezi-types'

export type Composer = (main: boolean, handlers: Handler[]) => Dispatch
export type ComposerSingle = (handler: Handler) => Dispatch

export type EndHandler = (context: Context, errorHandler: ErrorHandler) => void
export type ErrorHandler = (context: Context, error: Partial<InternalError>) => void
export type ExecuteHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>) => void

const createContext = (context: Context, dispatch: Dispatch, errHandler: ErrorHandler) => {
    return {
        ...context
        , next: createNext(context, dispatch)
        , panic: createPanic(context, errHandler)
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

const createPanic = (context: Context, errHandler: ErrorHandler): Panic => {
    return function panic(error?: Error): void {
        if (error instanceof Error) {
            errHandler(context, error)
            return
        }

        errHandler(context, createError(500, 'panic error param, must be instance of Error'))
    }
}

export const composer = (endHandler: EndHandler
    , errHandler: ErrorHandler
    , execHandler: ExecuteHandler): Composer => (main: boolean, handlers: Handler[]): Dispatch => {
    const len = handlers.length
    let inc = 0
    return function dispatch(context: Context, payload?: unknown): void {
        if (inc < len) {
            const handler = handlers[inc++]
            const newContext = createContext(context, dispatch, errHandler)
            setImmediate(execHandler, newContext, handler, payload)
            return
        }

        main && setImmediate(endHandler, context, errHandler)
    }
}

export const composerSingle = (errHandler: ErrorHandler
    , execHandler: ExecuteHandler): ComposerSingle => (handler: Handler): Dispatch => {
    return function dispatch(context: Context, payload?: unknown): void {
        const newContext = createContext(context, dispatch, errHandler)
        setImmediate(execHandler, newContext, handler, payload)
    }
}
