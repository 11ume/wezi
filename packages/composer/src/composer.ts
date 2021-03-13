import { createError } from 'wezi-error'
import {
    Next
    , Panic
    , Context
    , Handler
    , ErrorHandler
    , HandlerMuti
    , Dispatch
} from 'wezi-types'

export type Composer = (errorHandlerCustom: ErrorHandler) => (main: boolean, ...handlers: Handler[]) => Dispatch
export type PreparedComposer = (main: boolean, ...handlers: Handler[]) => Dispatch
export type EndHandler = (context: Context, errorHandler: ErrorHandler) => void
export type ExecuteHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>) => void

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

export const $composer = Symbol('composer')

export const getComposerHandlers = (preparedComposer: PreparedComposer, handlers: HandlerMuti[]) => handlers.map(handler => {
    if (handler.id === $composer) return handler(preparedComposer)
    return handler
})

export const createComposer = (endHandler: EndHandler, errorHandler: ErrorHandler, executeHandler: ExecuteHandler): PreparedComposer => {
    return (main: boolean, ...handlers: Handler[]): Dispatch => {
        let inc = 0
        return function dispatch(context: Context, payload?: unknown): void {
            const newContext = createContext(context, dispatch, errorHandler)
            if (inc < handlers.length) {
                const handler = handlers[inc++]
                setImmediate(executeHandler, newContext, handler, payload)
                return
            }

            main && setImmediate(endHandler, context, errorHandler)
        }
    }
}
