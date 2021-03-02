import { PreparedComposer, $composer } from 'wezi-composer'
import { Context, Handler, ComposerHandler } from 'wezi-types'
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

const dispatchRoute = (found: Found, preparedComposer: PreparedComposer, context: Context): void => {
    if (context.req.method === 'HEAD') {
        replyHead(context)
        return
    }

    if (found.handlers) {
        const dispatch = preparedComposer(false, ...found.handlers)
        dispatch(context, found.params)
        return
    }

    const dispatch = preparedComposer(false, found.handler)
    dispatch(context, found.params)
}

const findRouteMatch = (matcher: Matcher, preparedComposer: PreparedComposer) => (context: Context, payload: unknown): void => {
    const found = matcher.lookup(context.req.method, context.req.url)
    if (found) {
        dispatchRoute(found, preparedComposer, context)
        return
    }

    context.next(payload)
}

const prepareRouterStack = (matcher: Matcher, entities: RouteEntity[]) => entities
    .forEach(entity => {
        matcher.create(entity.method, entity.path, ...entity.handlers)
    })

const prepareRoutes = (matcher: Matcher, entities: RouteEntity[], preparedComposer: PreparedComposer) => {
    prepareRouterStack(matcher, entities)
    return findRouteMatch(matcher, preparedComposer)
}

const createRouteEntity = (method: string) => (path: string | Handler, ...handlers: Handler[]): RouteEntity => {
    if (typeof path === 'function') {
        return {
            path: ''
            , method
            , handlers: [path, ...handlers]
        }
    }

    return {
        path
        , method
        , handlers
    }
}

export const route = (name: string, ...handlers: Handler[]) => (...entities: RouteEntity[]): RouteEntity[] => entities.map(entity => ({
    ...entity
    , handlers: [...handlers, ...entity.handlers]
    , path: `${name}${entity.path}`
}))

export const createRouter = (...entities: RouteEntity[] | RouteEntity[][]) => {
    const entitiesFlat = entities.flat()
    const match: ComposerHandler = (preparedComposer: PreparedComposer) => {
        const matcher = matchit()
        return prepareRoutes(matcher, entitiesFlat, preparedComposer)
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

