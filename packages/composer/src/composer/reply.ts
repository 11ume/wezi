import * as send from 'wezi-send'
import { Context } from 'wezi-types'

export const reply = (context: Context, value: unknown): void => {
    if (value === null) {
        send.empty(context, 204)
        return
    }

    if (value !== undefined) {
        send.send(context, context.res.statusCode, value)
    }
}

export const replyPromise = (context: Context, value: Promise<unknown>): Promise<void> => value
    .then((val: unknown) => reply(context, val))
    .catch(context.panic)
