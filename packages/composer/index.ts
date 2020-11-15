import { Context, Handler } from 'wezi-types'
import { send } from 'wezi-send'

type Dispatch = (context: Context, payload: unknown) => void

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
        context.next(err)
    }
}

const createContext = <T>(context: Context, newContext: T) => Object.assign(context, newContext)

const createNext = (context: Context, dispatch: Dispatch) => {
    return function next(payload: unknown): void {
        dispatch(context, payload)
    }
}

// end response if all higher-order handlers are executed, and none of them have ended the response
const end = (main: boolean, context: Context) => main && context.res.end()

const composer = (main: boolean, ...handlers: Handler[]) => {
    let i = 0
    return function dispatch(context: Context, payload?: unknown): void {
        if (context.res.writableEnded) return
        if (payload instanceof Error) {
            context.errorHandler(context, payload)
            return
        }
        if (i < handlers.length) {
            const handler = handlers[i++]
            const next = createNext(context, dispatch)
            const newContext = createContext(context, {
                next
            })

            setImmediate(execute, newContext, handler, payload)
            return
        }

        end(main, context)
    }
}

export default composer
