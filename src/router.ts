// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'
import UrlPattern from 'url-pattern'
import { Context, RequestListener, NextFunction } from 'application'

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

type MethodFunction = (ctx: ContextRoute, next: NextFunction, namespace?: string) => void

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

const findMethod = (method: string, givePath: RegExp | string, handler: RequestListener) => {
    return function matcher(ctx: ContextRoute, next: NextFunction, namespace = '') {
        const path = givePath === '/' ? '(/)' : givePath
        const route = path instanceof UrlPattern
            ? path
            : new UrlPattern(`${namespace}${path}`, patternOpts)

        const { params, query } = getParamsAndQuery(route, ctx.req.url)
        if (params && ctx.req.method === method) {
            const context = Object.assign(ctx, {
                params
                , query
            })

            return handler(context, next)
        }

        next()
    }
}

const router = (...funcs: MethodFunction[]) => funcs

export const createMethod = (method: string) => (path: RegExp | string, handler?: RequestListener) => {
    const upperMethod = method.toUpperCase()
    return findMethod(upperMethod, path, handler)
}

export const whitNamespace = (namespace: string) => (...funcs: MethodFunction[]) => funcs.map((handler) => {
    return (ctx: ContextRoute, next: NextFunction) => {
        return handler(ctx, next, namespace)
    }
})

export const get = createMethod('get')
export const del = createMethod('del')
export const put = createMethod('put')
export const path = createMethod('path')
export const post = createMethod('post')
export const head = createMethod('heat')
export const options = createMethod('options')

export default router
