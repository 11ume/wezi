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
        let data = payload
        if (data === undefined || data === null) {
            dispatch(context, data)
            return
        }

        if (typeof payload === 'object') {
            data = Object.assign(payload)
        }

        if (data instanceof Error) {
            context.errorHandler(context, data)
            return
        }

        dispatch(context, data)
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
