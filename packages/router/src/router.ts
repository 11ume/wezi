import { ParsedUrlQuery } from 'querystring'
import { getUrlQuery, getUrlParams } from './extractors'
import { Context, NextFunction, Handler } from 'wuok-types'
import composer from 'wuok-composer'
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

export type RouteEntity = {
    path: string
    route: Route
    method: string
    handlers: Handler[]
    namespace: string
}

const isHead = (ctx: Context) => ctx.req.method === 'HEAD'

const notMethodMatch = (method: string, itemMethod: string) => method !== itemMethod

const exetPatternMatch = (path: string, item: RouteEntity) => item.route.pattern.exec(path)

const createRouteContext = (ctx: ContextRoute, query: ParsedUrlQuery, params: {}) => Object.assign(ctx, {
    query
    , params
})

const dispatchRoute = (ctx: ContextRoute
    , item: RouteEntity
    , match: RegExpExecArray
    , query: ParsedUrlQuery) => {
    if (isHead(ctx)) {
        ctx.res.end()
        return
    }

    const params = getUrlParams(item, match)
    const context = createRouteContext(ctx, query, params)
    const dispatch = composer(false, ...item.handlers)
    dispatch(context)
}

const findRouteMatch = (stack: RouteEntity[]) => (ctx: ContextRoute, next: NextFunction) => {
    for (const item of stack) {
        if (notMethodMatch(ctx.req.method, item.method)) continue
        const { query, pathname } = getUrlQuery(ctx.req.url)
        const path = pathname ?? ctx.req.url
        const match = exetPatternMatch(path, item)
        if (match) {
            dispatchRoute(ctx, item, match, query)
            return
        }
    }

    // no route has matched
    next()
}

const creteRouteStackItem = (item: RouteEntity, namespace: string) => {
    const route = item.route ?? regexparam(`${namespace}${item.path}`)
    return {
        ...item
        , route
        , namespace
    }
}

const prepareRouteStack = (entities: RouteEntity[], namespace = ''): RouteEntity[] => entities.map((item) => creteRouteStackItem(item, namespace))

// make pre built of all route handlers
const prepareRoutes = (entities: RouteEntity[]) => {
    const stack = prepareRouteStack(entities)
    return findRouteMatch(stack)
}

const prepareRoutesWhitNamespace = (entities: RouteEntity[], namespace?: string) => {
    return prepareRouteStack(entities, namespace)
}

const createStackItem = (method: string) => (path: string, ...handlers: Handler[]): RouteEntity => {
    return {
        path
        , route: null
        , method
        , handlers
        , namespace: ''
    }
}

export const createRouter = (...entities: RouteEntity[] | RouteEntity[][]) => prepareRoutes(entities.flat())
export const withNamespace = (namespace: string) => (...entities: RouteEntity[]) => prepareRoutesWhitNamespace(entities, namespace)

export const post = createStackItem('POST')
export const get = createStackItem('GET')
export const put = createStackItem('PUT')
export const path = createStackItem('PATH')
export const del = createStackItem('DELETE')
export const head = createStackItem('HEAD')
export const options = createStackItem('OPTIONS')
