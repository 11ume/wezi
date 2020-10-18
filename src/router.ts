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

        next()
    }
}

// export const withNamespace = (_namespace: string) => (...funcs: RequestListener[]) => composeRoute(funcs)
export const get = (givenPath: RegExp | string, handler: RequestListener) => methodFn('GET', givenPath, handler)
const router = (...funcs: RequestListener[]) => funcs
export default router
