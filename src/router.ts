// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'
import UrlPattern from 'url-pattern'
import { RequestListener, NextFunction } from 'application'
import { IncomingMessage, ServerResponse } from 'http'

// const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

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

const methodFn = (method: string) => (givenPath: UrlPattern | string, handler: RequestListener) => {
    return (req: IncomingMessage, res: ServerResponse, next: NextFunction, namespace: string) => {
        const path = givenPath === '/' ? '(/)' : givenPath
        const route = path instanceof UrlPattern
            ? path
            : new UrlPattern(`${namespace}${path}`, patternOpts)

        const { params, query } = getParamsAndQuery(route, req.url)

        if (params && req.method === method) {
            return handler(Object.assign(req, {
                params, query
            }), res)
        }
    }
}

const findRoute = (funcs: RequestListener[]) => async (
    req: IncomingMessage
    , res: ServerResponse
    , next: NextFunction) => {
    for (const fn of funcs) {
        const result = await fn(req, res, next)
        if (result || res.headersSent) return result
    }
}

export const router = (...funcs: RequestListener[]) => findRoute(funcs)
export const withNamespace = (namespace: string) => (...funcs: RequestListener[]) => findRoute(funcs)
export const get = () => methodFn('get')
