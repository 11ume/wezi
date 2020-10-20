// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'
import { Context, RequestListener, NextFunction } from 'application'
import matchit from 'matchit'

export interface ContextRoute<P = void, Q = void> extends Context {
    params?: P
    , query?: Q
}

type handlerFunction = (ctx: ContextRoute, next: NextFunction, namespace?: string) => void

// const patternOpts = {
//     segmentNameCharset: 'a-zA-Z0-9_-'
//     , segmentValueCharset: 'a-zA-Z0-9@.+-_'
// }

const getParamsAndQuery = (url: string, routes: matchit.Route[]) => {
    const { query } = parse(url, true)
    const match = matchit.match(url, routes)
    const params = matchit.exec(url, match)

    return {
        query
        , params
    }
}

type HandlerStackItem = {
    path: string
    method: string
    handler: handlerFunction
    route?: matchit.Route
    namespace?: string
}

const routeStackPrepare = (handlerStackItems: HandlerStackItem[], namespace = ''): HandlerStackItem[] => {
    return handlerStackItems.map((item) => {
        const route = matchit.parse(`${namespace}${item.path}`)
        return {
            ...item
            , route
            , namespace
        }
    })
}

// find(method, url) {
//     let isHEAD = (method === 'HEAD')
//     let i = 0
//     let j = 0
//     let k
//     let tmp
//     let matches=[]
//     let params={}
//     let handlers=[]
//     let arr = this.routes

//     for (; i < arr.length; i++) {
//         tmp = arr[i]

//         if (tmp.method.length === 0
//             || tmp.method === method
//             || isHEAD && tmp.method === 'GET') {

//             if (tmp.keys === false) {

//                 matches = tmp.pattern.exec(url)
//                 if (matches === null) continue
//                 if (matches.groups !== void 0) {
//                     for (k in matches.groups) {
//                         params[k]=matches.groups[k]
//                     }
//                 }

//                 tmp.handlers.length > 1 ? (handlers=handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0])

//             } else if (tmp.keys.length > 0) {

//                 matches = tmp.pattern.exec(url)
//                 if (matches === null) continue
//                 for (j=0; j < tmp.keys.length;) params[tmp.keys[j]]=matches[++j];
//                 tmp.handlers.length > 1 ? (handlers=handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);

//             } else if (tmp.pattern.test(url)) {

//                 tmp.handlers.length > 1 ? (handlers=handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);

//             }
//         } // else not a match
//     }

//     return { params, handlers };
// }

const prepareRoutes = (handlerStackItems: HandlerStackItem[], namespace?: string) => {
    const routeStack = routeStackPrepare(handlerStackItems, namespace)
    const routes = routeStack.map((r) => r.route)
    return function find(ctx: ContextRoute, next: NextFunction) {
        const { query, params } = getParamsAndQuery(ctx.req.url, routes)
        for (let i = 0, len = routeStack.length; i < len; i++) {
            const item = routeStack[i]
            if (ctx.req.method === item.method) {
                const context = Object.assign(ctx, {
                    query
                    , params
                })

                return item.handler(context, next)
            }
        }

        next()
    }
}

const router = (...handlerStackItems: HandlerStackItem[]) => prepareRoutes(handlerStackItems)

const createHandlerMethod = (method: string) => (path: string, handler: RequestListener): HandlerStackItem => {
    const upperMethod = method.toUpperCase()
    return {
        method: upperMethod
        , path
        , handler
    }
}

export const whitNamespace = (namespace: string) => (...handlerStackItems: HandlerStackItem[]) => {
    return prepareRoutes(handlerStackItems, namespace)
}

export const get = createHandlerMethod('get')
export const del = createHandlerMethod('del')
export const put = createHandlerMethod('put')
export const path = createHandlerMethod('path')
export const post = createHandlerMethod('post')
export const head = createHandlerMethod('heat')
export const options = createHandlerMethod('options')

export default router
