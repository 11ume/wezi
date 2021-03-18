import { createError } from 'wezi-error'
import {
    Next
    , Panic
    , Context
    , Handler
    , HandlerOrComposer
    , ErrorHandler
} from 'wezi-types'

export type Composer = (errorHandlerCustom: ErrorHandler) => (main: boolean, ...handlers: Handler[]) => RunComposer
export type PrepareComposer = (...handlers: Handler[]) => RunComposer
export type RunComposer = (context: Context, payload?: unknown, increment?: number) => void
export type EndHandler = (context: Context, errorHandler: ErrorHandler) => void
export type ExecuteHandler = (context: Context, handler: Handler, payload: unknown | Promise<unknown>) => void

const createNext = (context: Context, run: RunComposer, increment: number): Next => {
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

const createContext = (context: Context, run: RunComposer, increment: number, errorHandler: ErrorHandler): Context => {
    return {
        req: context.req
        , res: context.res
        , next: createNext(context, run, increment)
        , panic: createPanic(context, errorHandler)
    }
}

export const $composer = Symbol('composer')

export const prepareComposerHandlers = (prepareComposer: PrepareComposer, handlers: HandlerOrComposer[]) => handlers.map(handler => {
    if (handler.id === $composer) return handler(prepareComposer)
    return handler
})

export const createComposer = (errorHandler: ErrorHandler, executeHandler: ExecuteHandler): PrepareComposer => {
    return (...handlers: Handler[]): RunComposer => {
        return function run(context: Context, payload?: unknown, increment = -1): void {
            const inc = increment + 1
            const ctx = createContext(context, run, inc, errorHandler)
            executeHandler(ctx, handlers[inc], payload)
        }
    }
}

export const createComposerMain = (endHandler: EndHandler, errorHandler: ErrorHandler, executeHandler: ExecuteHandler): PrepareComposer => {
    return (...handlers: Handler[]): RunComposer => {
        return function run(context: Context, payload?: unknown, increment = -1): void {
            const inc = increment + 1
            const ctx = createContext(context, run, inc, errorHandler)
            if (inc < handlers.length) {
                executeHandler(ctx, handlers[inc], payload)
                return
            }

            endHandler(context, errorHandler)
        }
    }
}

