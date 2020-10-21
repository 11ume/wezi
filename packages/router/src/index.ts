import { ParsedUrlQuery } from 'querystring'
import { Context, RequestListener, NextFunction } from 'wuok'
import { getUrlQuery, getUrlParams } from './extractors'
import regexparam from './regexparam'

type HandlerFunction = (ctx: ContextRoute, next: NextFunction, namespace?: string) => void

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

export type Route = {
    keys: Array<string> 
    , pattern: RegExp
}

export type RouteStackItem = {
    path: string
    method: string
    handler: HandlerFunction
    route: Route
    namespace: string
}

const isHead = (ctx: Context) => ctx.req.method === 'HEAD'

const notMethodMatch = (method: string, item: RouteStackItem) => method !== item.method

const exetPatternMatch = (path: string, item: RouteStackItem) => item.route.pattern.exec(path)

const createNewContext = (ctx: ContextRoute, query: ParsedUrlQuery, params: {}) => Object.assign(ctx, {
    query
    , params
})

// runs every time a request is made, and try match any route
const findRouteMatch = (ctx: ContextRoute, next: NextFunction, stack: RouteStackItem[]) => {
    for (let i = 0, len = stack.length; i < len; i++) {
        if (notMethodMatch(ctx.req.method, stack[i])) continue
        const item = stack[i]
        const qp = getUrlQuery(ctx.req.url)
        const path = qp.pathname ?? ctx.req.url
        const match = exetPatternMatch(path, item)

        if (match) {
            const params = getUrlParams(item, match)
            const context = createNewContext(ctx, qp.query, params)
            return item.handler(context, next)
        }

        // send empty request for head requests
        if (isHead(ctx)) {
            ctx.res.end()
            return
        }
    }

    // no path matches
    next()
}

// it make pre built of all router handlers
const prepareRoutes = (handlerStackItems: RouteStackItem[], namespace?: string) => {
    const stack = prepareRouteStack(handlerStackItems, namespace)
    return (ctx: ContextRoute, next: NextFunction) => findRouteMatch(ctx, next, stack)
}

const prepareRouteStack = (handlerStackItems: RouteStackItem[], namespace: string): RouteStackItem[] => {
    return handlerStackItems.map((item) => {
        const route = regexparam(`${namespace}${item.path}`)
        return {
            ...item
            , route
            , namespace
        }
    })
}

const createStackItem = (giveMethod: string) => (path: string, handler: RequestListener): RouteStackItem => {
    const method = giveMethod.toUpperCase()
    return {
        path
        , method
        , handler
        , route: null
        , namespace: ''
    }
}

const router = (...handlerStackItems: RouteStackItem[]) => prepareRoutes(handlerStackItems)

export const routerNamespace = (namespace: string) => (...handlerStackItems: RouteStackItem[]) => {
    return prepareRoutes(handlerStackItems, namespace)
}

export const get = createStackItem('get')
export const del = createStackItem('del')
export const put = createStackItem('put')
export const path = createStackItem('path')
export const post = createStackItem('post')
export const head = createStackItem('heat')
export const options = createStackItem('options')

export default router
