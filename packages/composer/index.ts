import { Context, Handler } from 'wezi-types'
import { send } from 'wezi-send'
import { HttpError } from 'wezi-error'

type Dispatch = (context: Context, payload: unknown) => void

// execute and manage the return of a handler
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
        if (val instanceof HttpError) {
            context.next(val)
        }
    } catch (err) {
        context.next(err)
    }
}

// create a function "next" used fo pass to next handler in the handler stack
const createNext = (context: Context, dispatch: Dispatch) => {
    return function next(payload: unknown) {
        let ctx = context
        if (payload instanceof Error) {
            ctx = Object.assign(context, {
                error: payload
            })
        }

        dispatch(ctx, payload)
    }
}

// end response if all higher-order handlers are executed, and none of them have ended the response
const end = (main: boolean, context: Context) => main && context.res.end()

// used for create a multi handler flow execution controller
const composer = (main: boolean, ...handlers: Handler[]) => {
    let i = 0
    return function dispatch(context: Context, payload?: unknown) {
        if (context.res.writableEnded) return
        if (context.error) {
            context.errorHandler(context)
            return
        }
        if (i < handlers.length) {
            const handler = handlers[i++]
            const next = createNext(context, dispatch)
            const newContext = Object.assign(context, {
                next
            })

            setImmediate(execute, newContext, handler, payload)
            return
        }

        end(main, context)
    }
}

export default composer
