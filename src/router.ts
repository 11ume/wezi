// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'
import UrlPattern from 'url-pattern'
import { Context, RequestListener, NextFunction } from 'application'

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

type handlerFunction = (ctx: ContextRoute, next: NextFunction, namespace?: string) => void

const patternOpts = {
    segmentNameCharset: 'a-zA-Z0-9_-'
    , segmentValueCharset: 'a-zA-Z0-9@.+-_'
}

const isPattern = (pattern: UrlPattern | string) => {
    return pattern instanceof UrlPattern
        ? pattern
        : new UrlPattern(pattern, patternOpts)
}

const getParamsAndQuery = (pattern: UrlPattern | string, url: string) => {
    const { query, pathname } = parse(url, true)
    const route = isPattern(pattern)
    const params = route.match(pathname)

    return {
        query
        , params
    }
}

type HandlerStackItem = {
    path: RegExp | string
    method: string
    handler: handlerFunction
    pattern?: UrlPattern
    namespace?: string
}

const routeStackPrepare = (handlerStackItems: HandlerStackItem[], namespace = ''): HandlerStackItem[] => {
    return handlerStackItems.map((item) => {
        const path = item.path === '/' ? '(/)' : item.path
        const pattern = path instanceof UrlPattern
            ? path
            : new UrlPattern(`${namespace}${path}`, patternOpts)
        return {
            ...item
            , pattern
            , namespace
        }
    })
}

const prepareRoutes = (handlerStackItems: HandlerStackItem[], namespace?: string) => {
    const routeStack = routeStackPrepare(handlerStackItems, namespace)
    return function find(ctx: ContextRoute, next: NextFunction) {
        for (let i = 0, len = routeStack.length; i < len; i++) {
            const item = routeStack[i]
            const { params, query } = getParamsAndQuery(item.pattern, ctx.req.url)
            if (params && ctx.req.method === item.method) {
                const context = Object.assign(ctx, {
                    params
                    , query
                })

                return item.handler(context, next)
            }
        }

        next()
    }
}

const router = (...handlerStackItems: HandlerStackItem[]) => prepareRoutes(handlerStackItems)

const createHandlerMethod = (method: string) => (path: RegExp | string, handler: RequestListener): HandlerStackItem => {
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
