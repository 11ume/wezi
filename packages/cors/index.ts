import { Context } from 'wuok-types'

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

const cors = (options: CorsOptions = {}) => (ctx: Context) => {
    const {
        origin = '*'
        , maxAge = DEFAULT_MAX_AGE_SECONDS
        , allowMethods = DEFAULT_ALLOW_METHODS
        , allowHeaders = DEFAULT_ALLOW_HEADERS
        , allowCredentials = true
        , exposeHeaders = []
    } = options

    ctx.res.setHeader('Access-Control-Allow-Origin', origin)
    if (allowCredentials) {
        ctx.res.setHeader('Access-Control-Allow-Credentials', 'true')
    }
    if (exposeHeaders.length) {
        ctx.res.setHeader('Access-Control-Expose-Headers', exposeHeaders.join(','))
    }

    const preFlight = ctx.req.method === 'OPTIONS'
    if (preFlight) {
        ctx.res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','))
        ctx.res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','))
        ctx.res.setHeader('Access-Control-Max-Age', String(maxAge))
    }
}

export default cors
