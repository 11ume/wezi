import regexparam from 'regexparam'
import { Context, Handler } from 'wezi-types'
import { composer, composerSingle } from 'wezi-composer'
import { getUrlParams } from './extractors'

export interface ParamsWildcard {
    wild: string
}

export type RouteEntity = {
    path: string
    single: boolean
    method: string
    handler: Handler
    handlers: Handler[]
    namespace: string
    keys: Array<string>
    params: boolean
    pattern: RegExp
}

const haveParams = (keys: string[]): boolean => keys.length > 0

const isHead = (context: Context): boolean => context.req.method === 'HEAD'

const replyHead = (context: Context): void => {
    context.res.writeHead(200, {
        'Content-Length': '0'
    })
    context.res.end(null, null, null)
}

const sanitizeUrl = (url: string): string => {
    const len = url.length
    for (let i = 0; i < len; i++) {
        const charCode = url.charCodeAt(i)
        // ignore '?', ';', '#'
        if (charCode === 63 || charCode === 59 || charCode === 35) {
            return url.slice(0, i)
        }
    }

    return url
}

const dispatchRoute = (context: Context, entity: RouteEntity, match: RegExpExecArray): void => {
    if (isHead(context)) {
        replyHead(context)
        return
    }

    const params = getUrlParams(entity, match)
    if (entity.single) {
        const dispatch = composerSingle(entity.handler)
        dispatch(context, params)
        return
    }

    const dispatch = composer(false, entity.handlers)
    dispatch(context, params)
}

const findRouteMatch = (routerEntities: RouteEntity[]) => (context: Context, payload: unknown): void => {
    for (const entity of routerEntities) {
        if (context.req.method !== entity.method) continue
        const url = sanitizeUrl(context.req.url)
        const match = entity.pattern.exec(url)
        if (match) {
            dispatchRoute(context, entity, match)
            return
        }
    }

    context.next(payload)
}

const creteRouteEntity = (entity: RouteEntity, namespace: string): RouteEntity => {
    const namespaceMerge = `${namespace}${entity.namespace}`
    const { keys, pattern } = regexparam(`${namespaceMerge}${entity.path}`)
    const params = haveParams(keys)
    return {
        ...entity
        , keys
        , params
        , pattern
        , namespace
    }
}

const prepareRouteStack = (entities: RouteEntity[], namespace = ''): RouteEntity[] => entities.map((entity) => creteRouteEntity(entity, namespace))

const prepareRoutes = (entities: RouteEntity[]) => {
    const stack = prepareRouteStack(entities)
    return findRouteMatch(stack)
}

const prepareRoutesWhitNamespace = (entities: RouteEntity[], namespace?: string) => {
    const stack = prepareRouteStack(entities, namespace)
    return findRouteMatch(stack)
}

const inSingleHandler = (handlers: Handler[]): boolean => handlers.length === 1

const createRouteEntity = (method: string) => (path: string, ...handlers: Handler[]): RouteEntity => {
    const single = inSingleHandler(handlers)
    const handler = handlers[0] ?? null
    const namespace = ''

    return {
        path
        , keys: null
        , pattern: null
        , params: false
        , single
        , method
        , handler
        , handlers
        , namespace
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

export const get = createRouteEntity('GET')
export const post = createRouteEntity('POST')
export const put = createRouteEntity('PUT')
export const del = createRouteEntity('DELETE')
export const head = createRouteEntity('HEAD')
export const patch = createRouteEntity('PATCH')
export const options = createRouteEntity('OPTIONS')
