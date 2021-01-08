import regexparam from 'regexparam'
import { Context, Handler } from 'wezi-types'
import composer from 'wezi-composer'
import { getUrlParams } from './extractors'

export interface ContextRouter<P = any> extends Context {
    readonly params: P
}

export interface ContextParamsWildcard<T = any> extends Context<T> {
    params: {
        wild: string
    }
}

export type Route = {
    keys: Array<string>
    pattern: RegExp
}

export type RouteEntity = {
    path: string
    route: Route
    method: string
    handlers: Handler[]
    namespace: string
}

const isHead = (context: Context) => context.req.method === 'HEAD'

const createRouteContext = (context: Context, params: unknown) => Object.assign(context, {
    params
})

const dispatchRoute = (context: Context, entity: RouteEntity, match: RegExpExecArray) => {
    if (isHead(context)) {
        context.res.end()
        return
    }

    const params = getUrlParams(entity, match)
    const routeContext = createRouteContext(context, params)
    const dispatch = composer(false, ...entity.handlers)
    dispatch(routeContext)
}

const findRouteMatch = (routerEntities: RouteEntity[]) => (context: Context) => {
    for (const entity of routerEntities) {
        if (context.req.method !== entity.method) continue
        const match = entity.route.pattern.exec(context.req.url)
        if (match) {
            dispatchRoute(context, entity, match)
            return
        }
    }

    context.next()
}

const creteRouteEntity = (entity: RouteEntity, namespace: string) => {
    const namespaceMerge = `${namespace}${entity.namespace}`
    const route = entity.route ?? regexparam(`${namespaceMerge}${entity.path}`)
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
    const stack = prepareRouteStack(entities, namespace)
    return findRouteMatch(stack)
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

export const createRouter = (namespace?: string) => (...entities: RouteEntity[] | RouteEntity[][]) => {
    const flat = [].concat(...entities)
    if (namespace) return prepareRoutesWhitNamespace(flat, namespace)
    return prepareRoutes(flat)
}

export const routes = (namespace?: string) => (...entities: RouteEntity[]) => {
    if (namespace) {
        return entities.map((entity) => {
            entity.namespace = namespace
            return entity
        })
    }

    return entities
}

export const post = createRouteEntity('POST')
export const get = createRouteEntity('GET')
export const put = createRouteEntity('PUT')
export const path = createRouteEntity('PATH')
export const del = createRouteEntity('DELETE')
export const head = createRouteEntity('HEAD')
export const options = createRouteEntity('OPTIONS')
