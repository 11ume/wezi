import { Context, Handler } from 'wezi-types'
import { Composer, ComposerSingle } from 'wezi-composer'
import Router from './redix/index.js'

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

const dispatchRoute = (found: any
    , composer: Composer
    , context: Context
    , composerSingle: ComposerSingle): void => {
    if (context.req.method === 'HEAD') {
        replyHead(context)
        return
    }

    if (found.handler.length === 1) {
        const dispatch = composerSingle(found.handler[0])
        dispatch(context, found.params)
        return
    }

    const dispatch = composer(false, found.handler)
    dispatch(context, found.params)
}

const findRouteMatch = (router: any
    , composer: Composer
    , composerSingle: ComposerSingle) => (context: Context, payload: unknown): void => {
    const found = router.lookup(context.req)
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

const prepareRouterStack = (router: any, entities: RouteEntity[]) => entities
    .forEach((entity) => {
        router.create(entity.method, entity.path, entity.handlers)
    })

const prepareRoutes = (router: any, entities: RouteEntity[], composer: Composer, composerSingle: ComposerSingle) => {
    prepareRouterStack(router, entities)
    return findRouteMatch(router, composer, composerSingle)
}

const createRouteEntity = (method: string) => (path: string, ...handlers: Handler[]): RouteEntity => {
    return {
        path
        , method
        , handlers
    }
}

export const createRouter = (composer: Composer, composerSingle: ComposerSingle) => (...entities: RouteEntity[]) => {
    const router = new Router()
    return prepareRoutes(router, entities, composer, composerSingle)
}

export const get = createRouteEntity('GET')
export const post = createRouteEntity('POST')
export const put = createRouteEntity('PUT')
export const del = createRouteEntity('DELETE')
export const head = createRouteEntity('HEAD')
export const patch = createRouteEntity('PATCH')
export const options = createRouteEntity('OPTIONS')
