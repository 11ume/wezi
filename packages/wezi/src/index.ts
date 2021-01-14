import http, { RequestListener, IncomingMessage, ServerResponse } from 'http'
import composer from 'wezi-composer'
import { body } from 'wezi-receive'
import { actions } from 'wezi-actions'
import { Context, Handler, Status } from 'wezi-types'
import createError from 'wezi-error'

type SharableKey = string | number | symbol

const setSharableValue = (obj: unknown, key: SharableKey, value: unknown, options: PropertyDescriptor = {}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { value: _, ...opts } = options
    return Object.defineProperties(obj, {
        [key]: {
            value
            , writable: true
            , ...opts
        }
    })
}

const sharable = <E>(c: Context) => {
    const weakmap = new WeakMap()
    const map = weakmap.set(c.req, {})
    return {
        set: <T extends E, K extends keyof T>(key: K, value: T[K], options?: PropertyDescriptor) => {
            const obj = map.get(c.req)
            try {
                setSharableValue(obj, key, value, options)
            } catch (err) {
                throw createError(500, `set sharable value error, key: ${key}`, err)
            }
        }
        , get: (key: any) => {
            const obj = weakmap.get(c.req)
            if (obj[key]) {
                return obj[key]
            }

            throw createError(500, `get sharable value error, dont exist key: ${key}`)
        }
    }
}

const status = (context: Context): Status => (code: number, message?: string) => {
    context.res.statusCode = code
    if (message) {
        context.res.statusMessage = message
    }
}

const createContext = (req: IncomingMessage, res: ServerResponse): Context => {
    return {
        req
        , res
        , body: null
        , next: null
        , panic: null
        , status: null
        , actions: null
        , sharable: null
    }
}

const createEnhancedContext = (context: Context): Context => {
    return {
        ...context
        , body: body(context)
        , status: status(context)
        , actions: actions(context)
        , sharable: sharable(context)
    }
}

const wezi = (...handlers: Handler[]) => function run(req: IncomingMessage, res: ServerResponse) {
    const dispatch = composer(true, ...handlers)
    const context = createContext(req, res)
    const enhancedContext = createEnhancedContext(context)
    dispatch(enhancedContext)
}

export const listen = (handler: RequestListener, port = 3000, hostname: string = null) => {
    const server = http.createServer(handler)
    server.listen(port, hostname)
    return server
}

export default wezi
