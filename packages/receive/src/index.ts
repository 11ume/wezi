import { IncomingMessage } from 'http'
import { Options as GetRawBodyOptions, Encoding as RawBodyEncoding } from 'raw-body'
import contentType from 'content-type'
import { Context, Body } from 'wezi-types'
import { getRawBody, getRawBodyBuffer } from './rawBody'
import { parseJSON } from './utils'

type CacheJsonMap = WeakMap<IncomingMessage, unknown>
type RawBodyCacheMap<T> = WeakMap<IncomingMessage, T>
type GetRawBodyFunction<T> = (options: GetRawBodyFunctionOptions<T>) => Promise<T>

type ResolveRawBodyOptions<T> = {
    limit: string | number
    context: Context
    encoding: RawBodyEncoding
    rawBodyCache: WeakMap<IncomingMessage, T>
    defaultContentType: string
}

type GetRawBodyFunctionOptions<T> = {
    context: Context
    encoding: RawBodyEncoding
    limit: string | number
    length: string
    rawBodyCache: WeakMap<IncomingMessage, T>
}

const resolveRawBody = <T>(fn: GetRawBodyFunction<T>, {
    context
    , limit
    , encoding
    , rawBodyCache
    , defaultContentType
}: ResolveRawBodyOptions<T>): Promise<T> => {
    const body = rawBodyCache.get(context.req)
    const type = context.req.headers['content-type'] ?? defaultContentType
    const length = context.req.headers['content-length']

    if (body) return Promise.resolve(body)
    if (encoding === undefined) {
        const { parameters } = contentType.parse(type)
        const charset = parameters.charset
        return fn({
            context
            , limit
            , length
            , encoding: charset
            , rawBodyCache
        })
    }

    return fn({
        context
        , limit
        , length
        , encoding
        , rawBodyCache
    })
}

const defaultBodySizeLimit = '1mb'

const toStringOrBuffer = () => {
    // avoid to read multiple times same stream object
    const rawBodyCache: RawBodyCacheMap<Buffer | string> = new WeakMap()
    return (context: Context, { limit = defaultBodySizeLimit, encoding }: GetRawBodyOptions = {}): Promise<Buffer | string> => {
        const defaultContentType = 'text/plain'
        return resolveRawBody(getRawBody, {
            context
            , limit
            , encoding
            , rawBodyCache
            , defaultContentType
        })
    }
}

const stringOrBuffer = toStringOrBuffer()

const toBuffer = () => {
    // avoid to read multiple times same stream object
    const rawBodyCache: RawBodyCacheMap<Buffer> = new WeakMap()
    return (context: Context, { limit = defaultBodySizeLimit, encoding }: GetRawBodyOptions = {}): Promise<Buffer> => {
        const defaultContentType = 'application/octet-stream'
        return resolveRawBody(getRawBodyBuffer, {
            context
            , limit
            , encoding
            , rawBodyCache
            , defaultContentType
        })
    }
}

const toJson = () => {
    // avoid re-interpreting json
    const cacheJsonMap: CacheJsonMap = new WeakMap()
    return <T>(context: Context, options?: GetRawBodyOptions): Promise<T> => stringOrBuffer(context, options)
        .then((rawBody) => {
            const cached = cacheJsonMap.get(context.req)
            if (cached) return cached

            const str = rawBody.toString()
            const body = parseJSON(str)
            cacheJsonMap.set(context.req, body)
            return body
        })
}

export const json = toJson()
export const buffer = toBuffer()
export const text = (context: Context, options?: GetRawBodyOptions) => stringOrBuffer(context, options)
    .then((body) => body.toString())

export const body = (context: Context): Body => {
    return {
        text: (options?: GetRawBodyOptions) => text(context, options)
        , json: <T>(options?: GetRawBodyOptions) => json<T>(context, options)
        , buffer: (options?: GetRawBodyOptions) => buffer(context, options)
    }
}
