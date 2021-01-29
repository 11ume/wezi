import { Context, Handler } from 'wezi-types'
import { Composer, ComposerSingle } from 'wezi-composer'
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

const dispatchRoute = (
    found: Found
    , composer: Composer
    , context: Context
    , composerSingle: ComposerSingle): void => {
    if (context.req.method === 'HEAD') {
        replyHead(context)
        return
    }

    if (found.handlers) {
        const dispatch = composer(false, found.handlers)
        dispatch(context, found.params)
        return
    }

    const dispatch = composerSingle(found.handler)
    dispatch(context, found.params)
}

const findRouteMatch = (matcher: Matcher
    , composer: Composer
    , composerSingle: ComposerSingle) => (context: Context, payload: unknown): void => {
    const found = matcher.lookup(context.req.method, context.req.url)
    if (found) {
        dispatchRoute(
            found
            , composer
            , context
            , composerSingle)
        return
    }

    context.next(payload)
}

const prepareRouterStack = (matcher: Matcher, entities: RouteEntity[]) => entities
    .forEach((entity) => {
        matcher.create(entity.method, entity.path, ...entity.handlers)
    })

const prepareRoutes = (matcher: any, entities: RouteEntity[], composer: Composer, composerSingle: ComposerSingle) => {
    prepareRouterStack(matcher, entities)
    return findRouteMatch(matcher, composer, composerSingle)
}

const createRouteEntity = (method: string) => (path: string, ...handlers: Handler[]): RouteEntity => {
    return {
        path
        , method
        , handlers
    }
}

export const createRouter = (composer: Composer, composerSingle: ComposerSingle) => (...entities: RouteEntity[]) => {
    const matcher = matchit()
    return prepareRoutes(matcher, entities, composer, composerSingle)
}

export const get = createRouteEntity('GET')
export const post = createRouteEntity('POST')
export const put = createRouteEntity('PUT')
export const del = createRouteEntity('DELETE')
export const head = createRouteEntity('HEAD')
export const patch = createRouteEntity('PATCH')
export const options = createRouteEntity('OPTIONS')
