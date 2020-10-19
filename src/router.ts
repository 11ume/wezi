// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'
import UrlPattern from 'url-pattern'
import { Context, RequestListener, NextFunction } from 'application'

// const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
export interface ContextRouter<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

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

const methodFn = (method: string
    , givenPath: RegExp | string
    , handler: RequestListener) => {
    return (ctx: ContextRouter, next: NextFunction) => {
        const path = givenPath === '/' ? '(/)' : givenPath
        const route = path instanceof UrlPattern
            ? path
            : new UrlPattern((path as string), patternOpts)

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

// export const withNamespace = (_namespace: string) => (...funcs: RequestListener[]) => composeRoute(funcs)
export const get = (givenPath: RegExp | string, handler: RequestListener) => methodFn('GET', givenPath, handler)
const router = (...funcs: RequestListener[]) => funcs
export default router
