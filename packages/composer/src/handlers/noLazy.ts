import { Context, Handler } from 'wezi-types'
import { isPromise } from './common/utils'

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
