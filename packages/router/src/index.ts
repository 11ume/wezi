import { ParsedUrlQuery } from 'querystring'
import { Context, RequestListener, NextFunction } from 'wuok'
import { getUrlQuery, getUrlParams } from './extractors'
import regexparam from './regexparam'

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
    route?: Route
    namespace?: string
    handler: HandlerFunction
}

type HandlerFunction = (ctx: ContextRoute, next: NextFunction, namespace?: string) => void

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

// compares the incoming meter with one in the stack 
const notMethodMatch = (method: string, routeStack: RouteStackItem[], index: number) => method !== routeStack[index].method

// only executes the url pattern matcher, to check if it is a match
const exectPatternMatch = (path: string, item: RouteStackItem) => item.route.pattern.exec(path)

// create new context object whit query and params
const createNewContext = (ctx: ContextRoute, query: ParsedUrlQuery, params: {}) => Object.assign(ctx, {
    query
    , params
})

const getPath = (pathname: string, url: string) => pathname ?? url

const findRouteMatch = (stack: RouteStackItem[]) => {
    // runs every time a request arrives, and find and invoked the handler involved 
    return (ctx: ContextRoute, next: NextFunction) => {
        const url = ctx.req.url
        const method = ctx.req.method

        for (let i = 0, len = stack.length; i < len; i++) {
            if (notMethodMatch(method, stack, i)) continue
            const item = stack[i]
            const qp = getUrlQuery(url)
            const path = getPath(qp.pathname, url) 
            const match = exectPatternMatch(path, item)
            const params = getUrlParams(item, match)
    
            if (match) {
                const context = createNewContext(ctx, qp.query, params)
                return item.handler(context, next)
            }
    
            // send empty request for head requests
            if (isHead(ctx) && match) {
                ctx.res.end()
                return
            }
        }
    
        // no path matches
        next()
    }
}

// it make pre built of all router handlers
const prepareRoutes = (handlerStackItems: RouteStackItem[], namespace?: string) => {
    const stack = routeStackPrepare(handlerStackItems, namespace)
    return findRouteMatch(stack)
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
