// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'
import { Context, RequestListener, NextFunction } from 'application'
import regexparam from 'regexparam'

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

type HandlerStackItem = {
    path: string
    method: string
    handler: HandlerFunction
    route?: Route
    namespace?: string
}

type HandlerFunction = (ctx: ContextRoute, next: NextFunction, namespace?: string) => void

type Route = {
    keys: Array<string>
    , pattern: RegExp
}

const exec = (path: string, result: Route) => {
    let i = 0
    const params = {}
    const matches = result.pattern.exec(path)
    // eslint-disable-next-line no-unmodified-loop-condition
    while (matches && i < result.keys.length) {
        const key = result.keys[i]
        params[key] = matches[++i] || null
    }

    return {
        params
        , matches
    }
}

const getParamsAndQuery = (url: string, route: Route) => {
    const { query } = parse(url, true)
    const { params, matches } = exec(url, route)

    return {
        query
        , params
        , matches
    }
}

const routeStackPrepare = (handlerStackItems: HandlerStackItem[], namespace = ''): HandlerStackItem[] => {
    return handlerStackItems.map((item) => {
        const route = regexparam(`${namespace}${item.path}`)
        return {
            ...item
            , route
            , namespace
        }
    })
}

const isHead = (ctx: Context) => ctx.req.method === 'HEAD'

const prepareRoutes = (handlerStackItems: HandlerStackItem[], namespace?: string) => {
    const routeStack = routeStackPrepare(handlerStackItems, namespace)
    return function find(ctx: ContextRoute, next: NextFunction) {
        for (let i = 0, len = routeStack.length; i < len; i++) {
            const item = routeStack[i]
            const { query, params, matches } = getParamsAndQuery(ctx.req.url, item.route)
            if (matches && ctx.req.method === item.method) {
                const context = Object.assign(ctx, {
                    query
                    , params
                })

                return item.handler(context, next)
            }

            if (matches && isHead(ctx)) {
                ctx.res.end()
                return
            }
        }

        next()
    }
}

const router = (...handlerStackItems: HandlerStackItem[]) => prepareRoutes(handlerStackItems)

const createHandlerMethod = (method: string) => (path: string, handler: RequestListener): HandlerStackItem => {
    const upperMethod = method.toUpperCase()
    return {
        method: upperMethod
        , path
        , handler
    }
}

export const whitNamespace = (namespace: string) => (...handlerStackItems: HandlerStackItem[]) => {
    return prepareRoutes(handlerStackItems, namespace)
}

export const get = createHandlerMethod('get')
export const del = createHandlerMethod('del')
export const put = createHandlerMethod('put')
export const path = createHandlerMethod('path')
export const post = createHandlerMethod('post')
export const head = createHandlerMethod('heat')
export const options = createHandlerMethod('options')

export default router
