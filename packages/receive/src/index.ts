import { IncomingMessage } from 'http'
import { Context, Receive } from 'wezi-types'
import { parseJSON } from './utils'
import { getRawBody, getRawBodyBuffer } from './buffer'
import { Options as GetRawBodyOptions, Encoding as RawBodyEncoding } from 'raw-body'
import contentType from 'content-type'

type CacheJsonMap = WeakMap<IncomingMessage, unknown>
type RawBodyCacheMap<T> = WeakMap<IncomingMessage, T>
type GetRawBodyFunction <T> = (options: GetRawBodyFunctionOptions<T>) => Promise<T>

type ResolveRawBodyOptions = {
    limit: string | number
    context: Context
    encoding: RawBodyEncoding
    rawBodyCache: WeakMap<IncomingMessage, any>
    defaultContentType: string
}

type GetRawBodyFunctionOptions<T> = {
    context: Context
    encoding: RawBodyEncoding
    limit: string | number
    length: string
    rawBodyCache: WeakMap<IncomingMessage, T>
}

const defaultBodySizeLimit = '1mb'
const stringOrBuffer = toStringOrBuffer()

export const json = toJson()
export const buffer = toBuffer()
export const text = (context: Context, options?: GetRawBodyOptions) => stringOrBuffer(context, options)
    .then((body) => body.toString())

export function createReceive (context: Context): Receive {
    return {
        text: (options?: GetRawBodyOptions) => text(context, options)
        , json: <T>(options?: GetRawBodyOptions) => json<T>(context, options)
        , buffer: (options?: GetRawBodyOptions) => buffer(context, options)
    }
}

function resolveRawBody <T>(fn: GetRawBodyFunction<T>, {
    context
    , limit
    , encoding
    , rawBodyCache
    , defaultContentType
}: ResolveRawBodyOptions): Promise<T> {
    const body = rawBodyCache.get(context.req)
    const type = context.req.headers['content-type'] ?? defaultContentType
    const length = context.req.headers['content-length']

    if (body) return Promise.resolve(body)
    if (encoding === undefined) {
        const parameters = contentType.parse(type)?.parameters
        const charset = parameters?.charset
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

function toStringOrBuffer() {
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

function toBuffer() {
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

function toJson() {
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

