// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'
import { Context, RequestListener, NextFunction } from 'application'

const isHead = (ctx: Context) => ctx.req.method === 'HEAD'

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

const regexparam = (str: string, loose?: string) => {
    let c = ''
    let o = 0
    let tmp = ''
    let ext = 0
    const keys = []
    let pattern = ''
    const arr = str.split('/')
    arr[0] || arr.shift()

    // eslint-disable-next-line no-cond-assign
    while (tmp = arr.shift()) {
        c = tmp[0]
        if (c === '*') {
            keys.push('wild')
            pattern += '/(.*)'
        } else if (c === ':') {
            o = tmp.indexOf('?', 1)
            ext = tmp.indexOf('.', 1)
            keys.push(tmp.substring(1, ~o ? o : ~ext ? ext : tmp.length))
            pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)'
            if (~ext) pattern += (~o ? '?' : '') + '\\' + tmp.substring(ext)
        } else {
            pattern += '/' + tmp
        }
    }

    return {
        keys: keys
        , pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i')
    }
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

const isPatternMatch = (ctx: Context, item: RouteStackItem) => item.route.pattern.exec(ctx.req.url)

const prepareRoutes = (handlerStackItems: RouteStackItem[], namespace?: string) => {
    const routeStack = routeStackPrepare(handlerStackItems, namespace)
    return function find(ctx: ContextRoute, next: NextFunction) {
        const method = ctx.req.method
        for (let i = 0, len = routeStack.length; i < len; i++) {
            if (method !== routeStack[i].method) continue
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
