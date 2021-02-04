import * as send from 'wezi-send'
import { Context, Handler } from 'wezi-types'
import { isPromise } from './utils'

const reply = (context: Context, value: unknown): void => {
    if (value === null) {
        send.empty(context, 204)
        return
    }

    if (value !== undefined) {
        send.send(context, context.res.statusCode, value)
    }
}

const replyPromise = (context: Context, value: Promise<unknown>): Promise<void> => value
    .then((val: unknown) => reply(context, val))
    .catch(context.panic)

export const executeNoLazy = (context: Context, handler: Handler, payload: unknown | Promise<unknown>): void => {
    try {
        const value = handler(context, payload)
        if (value && isPromise(value)) {
            value.catch(context.panic)
            return
        }
    } catch (err) {
        context.panic(err)
    }
}

export const executeHandlerLazy = (context: Context, handler: Handler, payload: unknown | Promise<unknown>): void => {
    try {
        const value = handler(context, payload)
        if (value && isPromise(value)) {
            replyPromise(context, value)
            return
        }

        reply(context, value)
    } catch (err) {
        context.panic(err)
    }
}
