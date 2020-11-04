import { Context } from 'wezi-types'

const DEFAULT_ALLOW_METHODS: string[] = [
    'POST'
    , 'GET'
    , 'PUT'
    , 'PATCH'
    , 'DELETE'
    , 'OPTIONS'
]

const DEFAULT_ALLOW_HEADERS: string[] = [
    'X-Requested-With'
    , 'Access-Control-Allow-Origin'
    , 'X-HTTP-Method-Override'
    , 'Content-Type'
    , 'Authorization'
    , 'Accept'
]

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 hours

export type CorsOptions = {
    origin?: string
    , maxAge?: number
    , allowMethods?: string[]
    , allowHeaders?: string[]
    , allowCredentials?: true
    , exposeHeaders?: string[]
}

const cors = (options: CorsOptions = {}) => (context: Context) => {
    const {
        origin = '*'
        , maxAge = DEFAULT_MAX_AGE_SECONDS
        , allowMethods = DEFAULT_ALLOW_METHODS
        , allowHeaders = DEFAULT_ALLOW_HEADERS
        , allowCredentials = true
        , exposeHeaders = []
    } = options

    context.res.setHeader('Access-Control-Allow-Origin', origin)
    if (allowCredentials) {
        context.res.setHeader('Access-Control-Allow-Credentials', 'true')
    }
    if (exposeHeaders.length) {
        context.res.setHeader('Access-Control-Expose-Headers', exposeHeaders.join(','))
    }

    const preFlight = context.req.method === 'OPTIONS'
    if (preFlight) {
        context.res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','))
        context.res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','))
        context.res.setHeader('Access-Control-Max-Age', String(maxAge))
    }

    context.next()
}

export default cors
