import { Context, Handler } from 'wezi-types'
import { reply, replyPromise } from './reply'
import { isPromise } from './utils'

export const executeHandlerNoLazy = (context: Context, handler: Handler, payload: unknown | Promise<unknown>): void => {
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
