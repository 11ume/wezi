import queryString from 'querystring'
import { Context, RequestListener, NextFunction } from 'wuok'
import regexparam from './src/regexparam'

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

export type RouteStackItem = {
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

const checkQuery = (url: string) => {
    const index = url.indexOf('?', 1)
    const isQuery = index !== -1
    return {
        index
        , isQuery
    }
}

const getQueryString = (url: string, idx: number) => {
    const search = url.substring(idx)
    const path = search.substring(1)
    const pathname = url.substring(0, idx)
    const query = queryString.parse(path)

    return {
        query
        , pathname
    }
}

const routeStackPrepare = (handlerStackItems: RouteStackItem[], namespace = ''): RouteStackItem[] => {
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
const isPatternMatch = (path: string, item: RouteStackItem) => item.route.pattern.exec(path)
const isNotMethodMatch = (method: string, routeStack: RouteStackItem[], index: number) => method !== routeStack[index].method

const getUrlQuery = (baseUrl: string) => {
    const cq = checkQuery(baseUrl)
    if (cq.isQuery) {
        return getQueryString(baseUrl, cq.index)
    }

    return {
        query: {}
        , pathname: null
    }
}

const getParams = (item: RouteStackItem, match: RegExpExecArray) => {
    return match ? regExpExtractParams(item.route, match) : {}
}

const prepareRoutes = (handlerStackItems: RouteStackItem[], namespace?: string) => {
    const routeStack = routeStackPrepare(handlerStackItems, namespace)
    return function find(ctx: ContextRoute, next: NextFunction) {
        const baseUrl = ctx.req.url
        const method = ctx.req.method
        for (let i = 0, len = routeStack.length; i < len; i++) {
            if (isNotMethodMatch(method, routeStack, i)) continue
            const item = routeStack[i]
            const qs = getUrlQuery(baseUrl)
            const path = qs.pathname || baseUrl
            const match = isPatternMatch(path, item)
            const params = getParams(item, match)

            if (match) {
                const context = Object.assign(ctx, {
                    query: qs.query
                    , params
                })

                return item.handler(context, next)
            }

            // send empty request for headers requests
            if (isHead(ctx) && match) {
                ctx.res.end()
                return
            }
        }

        next()
    }
}

const router = (...handlerStackItems: RouteStackItem[]) => prepareRoutes(handlerStackItems)

const createHandlerMethod = (method: string) => (path: string, handler: RequestListener): RouteStackItem => {
    const upperMethod = method.toUpperCase()
    return {
        method: upperMethod
        , path
        , handler
    }
}

export const routerNamespace = (namespace: string) => (...handlerStackItems: RouteStackItem[]) => {
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
