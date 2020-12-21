import { Context, Handler } from 'wezi-types'
import { createError } from 'wezi-error'
import { send } from 'wezi-send'
import { shareable } from 'wezi-shared'

type Dispatch = (context: Context, payload?: unknown) => void

const createContext = <T>(context: Context, obj: T) => Object.assign(context, obj)

// end response if all higher-order handlers are executed, and none of them have ended the response
const end = (context: Context) => {
    context.res.statusCode = 404
    context.res.end()
}

const execute = async (context: Context, handler: Handler, payload: unknown) => {
    if (context.res.writableEnded) return
    try {
        const val = await handler(context, payload)
        if (val === null) {
            send(context, 204, val)
            return
        }

        if (val !== undefined) {
            send(context, context.res.statusCode, val)
            return
        }
    } catch (err) {
        context.panic(err)
    }
}

const createNext = (context: Context, dispatch: Dispatch) => {
    return function next(payload?: unknown): void {
        if (payload === undefined) {
            dispatch(context)
            return
        }

        dispatch(context, payload)
    }
}

const createPanic = (context: Context) => {
    return function panic(error?: Error): void {
        if (error instanceof Error) {
            shareable.errorHandler(context, error)
            return
        }

        shareable.errorHandler(context, createError(500, 'panic payload must be instance of Error'))
    }
}

export const composer = (main: boolean, ...handlers: Handler[]) => {
    let i = 0
    return function dispatch(context: Context, payload?: unknown): void {
        if (i < handlers.length) {
            const handler = handlers[i++]
            const next = createNext(context, dispatch)
            const panic = createPanic(context)
            const newContext = createContext(context, {
                next
                , panic
            })

            setImmediate(execute, newContext, handler, payload)
            return
        }

        main && setImmediate(end, context)
    }
}
