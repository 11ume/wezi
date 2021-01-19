import regexparam from 'regexparam'
import { Context, Handler } from 'wezi-types'
import { Composer, ComposerSingle } from 'wezi-composer'
import { getUrlParams } from './extractors'

type RouteEntity = {
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

const dispatchRoute = (context: Context
    , composer: Composer
    , composerSingle: ComposerSingle
    , entity: RouteEntity
    , match: RegExpExecArray): void => {
    if (context.req.method === 'HEAD') {
        replyHead(context)
        return
    }

    const params = getUrlParams(entity.params, entity.keys, match)
    if (entity.single) {
        const dispatch = composerSingle(entity.handler)
        dispatch(context, params)
        return
    }

    const dispatch = composer(false, entity.handlers)
    dispatch(context, params)
}

const findRouteMatch = (routerEntities: RouteEntity[]
    , composer: Composer
    , composerSingle: ComposerSingle) => (context: Context, payload: unknown): void => {
    for (const entity of routerEntities) {
        if (context.req.method !== entity.method) continue
        const url = sanitizeUrl(context.req.url)
        const match = entity.pattern.exec(url)
        if (match) {
            dispatchRoute(context
                , composer
                , composerSingle
                , entity
                , match)
            return
        }
    }

    context.next(payload)
}

const mapEntityWhitNamespace = (namespace: string, entities: RouteEntity[]) => entities.map((entity) => {
    return {
        ...entity
        , namespace
    }
})

const mapRouteEntity = (entity: RouteEntity, namespace = '') => {
    const namespaceMerge = `${namespace}${entity.namespace}`
    const { keys, pattern } = regexparam(`${namespaceMerge}${entity.path}`)
    const params = keys.length > 0
    return {
        ...entity
        , keys
        , params
        , pattern
        , namespace
    }
}

const prepareRouterStack = (entities: RouteEntity[], namespace?: string): RouteEntity[] => entities
    .map((entity) => mapRouteEntity(entity, namespace))

const prepareRoutes = (entities: RouteEntity[], composer: Composer, composerSingle: ComposerSingle) => {
    const stack = prepareRouterStack(entities)
    return findRouteMatch(stack, composer, composerSingle)
}

const createRouteEntity = (method: string) => (path: string, ...handlers: Handler[]): RouteEntity => {
    const single = handlers.length === 1
    const handler = handlers[0] ?? null
    const namespace = ''
    const keys = null
    const pattern = null
    const params = null

    return {
        path
        , single
        , method
        , handler
        , handlers
        , namespace
        , keys
        , params
        , pattern
    }
}

export const createRouter = (composer: Composer, composerSingle: ComposerSingle) => (...entities: RouteEntity[]) => {
    return prepareRoutes(entities, composer, composerSingle)
}

export const createRouterSpace = (composer: Composer, composerSingle: ComposerSingle) => (namespace = '') => (...entities: RouteEntity[]) => {
    const entitiesWhitSpace = mapEntityWhitNamespace(namespace, entities)
    return prepareRoutes(entitiesWhitSpace, composer, composerSingle)
}

export const get = createRouteEntity('GET')
export const post = createRouteEntity('POST')
export const put = createRouteEntity('PUT')
export const del = createRouteEntity('DELETE')
export const head = createRouteEntity('HEAD')
export const patch = createRouteEntity('PATCH')
export const options = createRouteEntity('OPTIONS')
