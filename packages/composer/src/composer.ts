import { createError } from 'wezi-error'
import {
    Next
    , Panic
    , Context
    , Handler
    , ErrorHandler
    , HandlerMuti
} from 'wezi-types'

export type Composer = (errorHandlerCustom: ErrorHandler) => (main: boolean, ...handlers: Handler[]) => Run
export type PreparedComposer = (main: boolean, ...handlers: Handler[]) => Run
export type EndHandler = (context: Context, errorHandler: ErrorHandler) => void
export type ExecuteHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>) => void
type Run = (context: Context, payload?: unknown, inc?: number) => void

const createNext = (context: Context, run: Run, increment: number): Next => {
    return function next(payload?: unknown): void {
        if (payload === undefined) {
            run(context, undefined, increment)
            return
        }

        run(context, payload, increment)
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

const createContext = (context: Context, run: Run, increment: number, errorHandler: ErrorHandler): Context => {
    return {
        ...context
        , next: createNext(context, run, increment)
        , panic: createPanic(context, errorHandler)
    }
}

export const $composer = Symbol('composer')

export const prepareComposerHandlers = (preparedComposer: PreparedComposer, handlers: HandlerMuti[]) => handlers.map(handler => {
    if (handler.id === $composer) return handler(preparedComposer)
    return handler
})

export const createComposer = (endHandler: EndHandler, errorHandler: ErrorHandler, executeHandler: ExecuteHandler): PreparedComposer => {
    return (main: boolean, ...handlers: Handler[]): Run => function run(context: Context, payload?: unknown, inc = -1): void {
        const increment = inc + 1
        const newContext = createContext(context, run, increment, errorHandler)
        if (increment < handlers.length) {
            const handler = handlers[increment]
            setImmediate(executeHandler, newContext, handler, payload)
            return
        }

        main && setImmediate(endHandler, context, errorHandler)
    }
}
