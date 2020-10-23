import { ParsedUrlQuery } from 'querystring'
import { Context, RequestListener, NextFunction, $handlers } from 'wuok'
import { getUrlQuery, getUrlParams } from './extractors'
import regexparam from './regexparam'

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

export interface ContextRouteWild extends Context {
    params?: {
        wild: string
    }
}

export type Route = {
    keys: Array<string>
    , pattern: RegExp
}

export type RouteStackItem = {
    path: string
    method: string
    route: Route
    handlers: RequestListener[]
    namespace: string
}

const isHead = (ctx: Context) => ctx.req.method === 'HEAD'

const notMethodMatch = (method: string, itemMethod: string) => method !== itemMethod

const exetPatternMatch = (path: string, item: RouteStackItem) => {
    return item.route.pattern.exec(path)
}

const createNewContext = (ctx: ContextRoute, query: ParsedUrlQuery, params: {}) => Object.assign(ctx, {
    query
    , params
})

// runs every time a request is made, and try match any route
const findRouteMatch = (ctx: ContextRoute, next: NextFunction, stack: RouteStackItem[]) => {
    for (const item of stack) {
        if (notMethodMatch(ctx.req.method, item.method)) continue
        const qp = getUrlQuery(ctx.req.url)
        const path = qp.pathname ?? ctx.req.url
        const match = exetPatternMatch(path, item)

        if (match) {
            const params = getUrlParams(item, match)
            const context = createNewContext(ctx, qp.query, params)
            return {
                $handlers
                , context
                , handlers: item.handlers
            }
        }

        // send empty request for head requests
        if (isHead(ctx)) {
            ctx.res.end()
            return undefined
        }
    }

    // no path matches
    next()
    return undefined
}

const creteRouteStackItem = (item: RouteStackItem, namespace: string) => {
    const route = item.route ?? regexparam(`${namespace}${item.path}`)
    return {
        ...item
        , route
        , namespace
    }
}

const prepareRouteStack = (handlerStackItems: RouteStackItem[], namespace = ''): RouteStackItem[] => {
    return handlerStackItems.map((item) => creteRouteStackItem(item, namespace))
}

// it make pre built of all router handlers
const prepareRoutes = (handlerStackItems: RouteStackItem[]) => {
    const stack = prepareRouteStack(handlerStackItems)
    return (ctx: ContextRoute, next: NextFunction) => findRouteMatch(ctx, next, stack)
}

const prepareRoutesWhitNamespace = (handlerStackItems: RouteStackItem[], namespace?: string) => {
    return prepareRouteStack(handlerStackItems, namespace)
}

const createStackItem = (giveMethod: string) => (path: string, ...handlers: RequestListener[]): RouteStackItem => {
    const method = giveMethod.toUpperCase()
    return {
        path
        , method
        , handlers
        , route: null
        , namespace: ''
    }
}

export const createRouter = (...handlerStackItems: RouteStackItem[] | RouteStackItem[][]) => {
    return prepareRoutes(handlerStackItems.flat())
}

// create router whit namespace
export const withNamespace = (namespace: string) => (...handlerStackItems: RouteStackItem[]) => {
    return prepareRoutesWhitNamespace(handlerStackItems, namespace)
}

export const get = createStackItem('get')
export const del = createStackItem('delete')
export const put = createStackItem('put')
export const path = createStackItem('path')
export const post = createStackItem('post')
export const head = createStackItem('head')
export const options = createStackItem('options')


