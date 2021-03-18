import { PrepareComposer, $composer } from 'wezi-composer'
import { Context, Handler, HandlerComposer } from 'wezi-types'
import matchit, { Matcher, Found } from 'matchit-radix-tree'

type RouteEntity = {
    path: string
    method: string
    handlers: Handler[]
}

const replyHead = (context: Context): void => {
    context.res.writeHead(200, {
        'Content-Length': '0'
    })
    context.res.end(null, null, null)
}

const handlerRouteResolver = (found: Found, context: Context): void => {
    if (context.req.method === 'HEAD') {
        replyHead(context)
        return
    }

    found.handler(context, found.params)
}

const matchRoute = (matcher: Matcher) => (context: Context, payload: unknown): void => {
    const found = matcher.lookup(context.req.method, context.req.url)
    if (found) {
        handlerRouteResolver(found, context)
        return
    }

    context.next(payload)
}

const prepareRouterStack = (matcher: Matcher, prepareComposer: PrepareComposer, entities: RouteEntity[]) => entities
    .forEach(entity => matcher.create(entity.method, entity.path, prepareComposer(...entity.handlers)))

const prepareRoutes = (matcher: Matcher, entities: RouteEntity[], prepareComposer: PrepareComposer) => {
    prepareRouterStack(matcher, prepareComposer, entities)
    return matchRoute(matcher)
}

const createRouteEntity = (method: string) => (pathOrHandler: string | Handler, ...handlers: Handler[]): RouteEntity => {
    if (typeof pathOrHandler === 'function') {
        return {
            path: ''
            , method
            , handlers: [pathOrHandler, ...handlers]
        }
    }

    return {
        path: pathOrHandler
        , method
        , handlers
    }
}

export const route = (name: string, ...handlers: Handler[]) => (...entities: RouteEntity[]): RouteEntity[] => entities.map(entity => ({
    ...entity
    , handlers: [...handlers, ...entity.handlers]
    , path: `${name}${entity.path}`
}))

export const createRouter = (...entities: (RouteEntity | RouteEntity[])[]): HandlerComposer => {
    const entitiesFlat = entities.flat()
    const match = (prepareComposer: PrepareComposer) => {
        const matcher = matchit()
        return prepareRoutes(matcher, entitiesFlat, prepareComposer)
    }

    Object.defineProperty(match, 'id', {
        value: $composer
        , writable: false
    })

    return match
}

export const get = createRouteEntity('GET')
export const post = createRouteEntity('POST')
export const put = createRouteEntity('PUT')
export const del = createRouteEntity('DELETE')
export const head = createRouteEntity('HEAD')
export const patch = createRouteEntity('PATCH')
export const options = createRouteEntity('OPTIONS')

