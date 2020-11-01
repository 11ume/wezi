import { ParsedUrlQuery } from 'querystring'
import { getUrlQuery, getUrlParams } from './extractors'
import { Context, Handler } from 'wezi-types'
import composer from 'wezi-composer'
import regexparam from './regexparam'

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

export interface ContextRouteWild extends Context {
    params?: {
        wild: string
    }
}

export type Route = {
    keys: Array<string>
    , pattern: RegExp
}

export type RouteEntity = {
    path: string
    route: Route
    method: string
    handlers: Handler[]
    namespace: string
}

const isHead = (context: Context) => context.req.method === 'HEAD'

const notMethodMatch = (method: string, entityMethod: string) => method !== entityMethod

const exetPatternMatch = (path: string, entity: RouteEntity) => entity.route.pattern.exec(path)

const createRouteContext = (context: ContextRoute, query: ParsedUrlQuery, params: {}) => Object.assign(context, {
    query
    , params
})

const dispatchRoute = (context: ContextRoute
    , entity: RouteEntity
    , match: RegExpExecArray
    , query: ParsedUrlQuery) => {
    if (isHead(context)) {
        context.res.end()
        return
    }

    const params = getUrlParams(entity, match)
    const newContext = createRouteContext(context, query, params)
    const dispatch = composer(false, entity.handlers)
    dispatch(newContext)
}

const findRouteMatch = (stack: RouteEntity[]) => (context: ContextRoute) => {
    for (const entity of stack) {
        if (notMethodMatch(context.req.method, entity.method)) continue
        const { query, pathname } = getUrlQuery(context.req.url)
        const path = pathname ?? context.req.url
        const match = exetPatternMatch(path, entity)
        if (match) {
            dispatchRoute(context, entity, match, query)
            return
        }
    }

    // no route has matched
    context.next()
}

const creteRouteEntity = (entity: RouteEntity, namespace: string) => {
    const route = entity.route ?? regexparam(`${namespace}${entity.path}`)
    return {
        ...entity
        , route
        , namespace
    }
}

const prepareRouteStack = (entities: RouteEntity[], namespace = ''): RouteEntity[] => entities.map((entity) => creteRouteEntity(entity, namespace))

// make pre built of all route handlers
const prepareRoutes = (entities: RouteEntity[]) => {
    const stack = prepareRouteStack(entities)
    return findRouteMatch(stack)
}

const prepareRoutesWhitNamespace = (entities: RouteEntity[], namespace?: string) => {
    return prepareRouteStack(entities, namespace)
}

const createRouteEntity = (method: string) => (path: string, ...handlers: Handler[]): RouteEntity => {
    return {
        path
        , route: null
        , method
        , handlers
        , namespace: ''
    }
}

export const createRouter = (...entities: RouteEntity[] | RouteEntity[][]) => prepareRoutes(entities.flat())
export const withNamespace = (namespace: string) => (...entities: RouteEntity[]) => prepareRoutesWhitNamespace(entities, namespace)

export const post = createRouteEntity('POST')
export const get = createRouteEntity('GET')
export const put = createRouteEntity('PUT')
export const path = createRouteEntity('PATH')
export const del = createRouteEntity('DELETE')
export const head = createRouteEntity('HEAD')
export const options = createRouteEntity('OPTIONS')
