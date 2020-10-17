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

const methodFn = (method: string
    , givenPath: RegExp | string
    , handler: RequestListener) => {
    return (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
        const path = givenPath === '/' ? '(/)' : givenPath
        const route = path instanceof UrlPattern
            ? path
            : new UrlPattern((path as string), patternOpts)

        const { params, query } = getParamsAndQuery(route, req.url)
        if (params && req.method === method) {
            const mergeReq = Object.assign(req, {
                params, query
            })

            return handler(mergeReq, res, next)
        }

        return null
    }
}

const findRoute = (funcs: RequestListener[]) => async (
    req: IncomingMessage
    , res: ServerResponse
    , next: NextFunction) => {
    for (const fn of funcs) {
        const result = await fn(req, res, next)
        if (res.headersSent) return
        return result
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const withNamespace = (_namespace: string) => (...funcs: RequestListener[]) => findRoute(funcs)
export const get = (givenPath: RegExp | string, handler: RequestListener) => methodFn('get', givenPath, handler)

const router = (...funcs: RequestListener[]) => findRoute(funcs)
export default router
