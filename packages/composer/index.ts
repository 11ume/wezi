import { Context, Handler, NextFunction } from 'wezi-types'
import { HttpError } from 'wezi-error'
import { send } from 'wezi-send'

type Dispatch = (c: Context, next?: NextFunction) => void

// execute and manage the return of a handler
const execute = async (c: Context, handler: Handler) => {
    try {
        const val = await handler(c)
        if (val === null) {
            send(c, 204, val)
            return
        }
        if (val !== undefined) {
            send(c, c.res.statusCode, val)
            return
        }
    }
    catch (err) {
        c.next(err)
    }
}

// create a function "next" used fo pass to next handler in the handler stack
const createNext = (c: Context, dispatch: Dispatch) => {
    return function next(error?: HttpError) {
        let nc = c
        if (error instanceof Error) {
            nc = Object.assign(c, {
                error
            })
        }
        dispatch(nc, next)
    }
}

// end response if all higher-order handlers are executed, and none of them have ended the response
const end = (main: boolean, c: Context) => main && c.res.end()

// used for create a multi handler flow execution controller
const composer = (main: boolean, ...handlers: Handler[]) => {
    let i = 0
    return function dispatch(c: Context) {
        if (c.res.writableEnded) return
        if (c.error) {
            c.errorHandler(c)
            return
        }
        if (i < handlers.length) {
            const handler = handlers[i++]
            const nx = createNext(c, dispatch)
            const nc = Object.assign(c, {
                next: nx
            })
            setImmediate(execute, nc, handler)
            return
        }

        end(main, c)
    }
}

export default composer
