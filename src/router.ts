// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'
import { Context, RequestListener, NextFunction } from 'application'
import regexparam from 'regexparam'

const isHead = (ctx: Context) => ctx.req.method === 'HEAD'

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

type HandlerStackItem = {
    path: string
    method: string
    route?: Route
    namespace?: string
    handler: HandlerFunction
}

type HandlerFunction = (ctx: ContextRoute, next: NextFunction, namespace?: string) => void

type Route = {
    keys: Array<string>
    , pattern: RegExp
}

const regExpExtractParams = (route: Route, match: RegExpExecArray) => {
    let i = 0
    const params = {}
    while (i < route.keys.length) {
        const key = route.keys[i]
        params[key] = match[++i] || null
    }

    return params
}

const getParamsAndQuery = (url: string, route: Route, match: RegExpExecArray) => {
    const { query } = parse(url, true)
    const params = regExpExtractParams(route, match)

    return {
        query
        , params
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

const isPatternMatch = (ctx: Context, item: HandlerStackItem) => item.route.pattern.exec(ctx.req.url)

const prepareRoutes = (handlerStackItems: HandlerStackItem[], namespace?: string) => {
    const routeStack = routeStackPrepare(handlerStackItems, namespace)
    return function find(ctx: ContextRoute, next: NextFunction) {
        const method = ctx.req.method
        for (let i = 0, len = routeStack.length; i < len; i++) {
            const item = routeStack[i]
            const match = isPatternMatch(ctx, item)
            if (match && method === item.method) {
                const result = getParamsAndQuery(ctx.req.url, item.route, match)
                const context = Object.assign(ctx, {
                    query: result.query
                    , params: result.params
                })

                return item.handler(context, next)
            }

            if (match && isHead(ctx)) {
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

export const routerNamespace = (namespace: string) => (...handlerStackItems: HandlerStackItem[]) => {
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
