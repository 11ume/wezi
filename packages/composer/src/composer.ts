import { createError } from 'wezi-error'
import {
    Next
    , Panic
    , Context
    , Handler
    , ErrorHandler
    , HandlerMuti
    , Run
} from 'wezi-types'

export type Composer = (errorHandlerCustom: ErrorHandler) => (main: boolean, ...handlers: Handler[]) => Run
export type PreparedComposer = (main: boolean, ...handlers: Handler[]) => Run
export type EndHandler = (context: Context, errorHandler: ErrorHandler) => void
export type ExecuteHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>) => void

const createNext = (context: Context, run: Run): Next => {
    return function next(payload?: unknown): void {
        if (payload === undefined) {
            run(context)
            return
        }

        run(context, payload)
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

const createContext = (context: Context, run: Run, errorHandler: ErrorHandler): Context => {
    return {
        ...context
        , next: createNext(context, run)
        , panic: createPanic(context, errorHandler)
    }
}

export const $composer = Symbol('composer')

export const prepareComposerHandlers = (preparedComposer: PreparedComposer, handlers: HandlerMuti[]) => handlers.map(handler => {
    if (handler.id === $composer) return handler(preparedComposer)
    return handler
})

export const createComposer = (endHandler: EndHandler, errorHandler: ErrorHandler, executeHandler: ExecuteHandler): PreparedComposer => {
    return (main: boolean, ...handlers: Handler[]): Run => {
        let inc = 0
        return function run(context: Context, payload?: unknown): void {
            const newContext = createContext(context, run, errorHandler)
            if (inc < handlers.length) {
                const handler = handlers[inc++]
                setImmediate(executeHandler, newContext, handler, payload)
                return
            }

            main && setImmediate(endHandler, context, errorHandler)
        }
    }
}
