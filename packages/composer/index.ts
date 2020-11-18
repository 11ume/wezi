import { Context, Handler } from 'wezi-types'
import { send } from 'wezi-send'
// import isPlainObject from 'is-plain-obj'
import createError from 'wezi-error'

type Dispatch = (context: Context, payload?: unknown) => void

// end response if all higher-order handlers are executed, and none of them have ended the response
const end = (context: Context) => {
    context.res.statusCode = 404
    context.res.end()
}

const createContext = <T>(context: Context, obj: T) => Object.assign(context, obj)

const execute = async (context: Context, handler: Handler, payload: unknown) => {
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
            context.errorHandler(context, error)
            return
        }

        context.errorHandler(context, createError(500, 'panic payload must be instance of Error'))
    }
}

const composer = (main: boolean, ...handlers: Handler[]) => {
    let i = 0
    return function dispatch(context: Context, payload?: unknown): void {
        if (context.res.writableEnded) return
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

        main && end(context)
    }
}

export default composer
