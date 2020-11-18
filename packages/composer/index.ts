import { Context, Handler } from 'wezi-types'
import { send } from 'wezi-send'

type Dispatch = (context: Context, payload: any) => void

// end response if all higher-order handlers are executed, and none of them have ended the response
const end = (context: Context) => {
    context.res.statusCode = 404
    context.res.end()
}

const createContext = <T>(context: Context, newContext: T) => Object.assign(context, newContext)

const execute = async (context: Context, handler: Handler, payload: any) => {
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

const createNext = (context: Context, dispatch: Dispatch) => {
    return function next(payload?: any): void {
        if (payload === undefined || payload === null) {
            dispatch(context, payload)
            return
        }

        if (payload instanceof Error) {
            context.errorHandler(context, payload)
            return
        }

        dispatch(context, payload)
    }
}

const composer = (main: boolean, ...handlers: Handler[]) => {
    let i = 0
    return function dispatch(context: Context, payload?: any): void {
        if (context.res.writableEnded) return
        if (i < handlers.length) {
            const handler = handlers[i++]
            const next = createNext(context, dispatch)
            const contextCopy = createContext(context, {
                next
            })

            setImmediate(execute, contextCopy, handler, payload)
            return
        }

        main && end(context)
    }
}

export default composer
