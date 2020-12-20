import { IncomingMessage } from 'http'
import { Context, Receive } from 'wezi-types'
import { parseJSON } from './utils'
import { parseBody, getRawBodyBuffer, RawBodyCacheMapBuffer } from './buffer'
import { Options as GetRawBodyOptions } from 'raw-body'
import contentType from 'content-type'

type CacheJsonMap = WeakMap<IncomingMessage, unknown>
type RawBodyCacheMapString = WeakMap<IncomingMessage, string>

const defaultBodySizeLimit = '1mb'
const stringOrBuffer = toStringOrBuffer()

export const json = toJson()
export const buffer = toBuffer()
export const text = (context: Context, options?: GetRawBodyOptions) => stringOrBuffer(context, options)
    .then((body) => body.toString())

export const createReceive = (context: Context): Receive => {
    return {
        json: <T>(options?: GetRawBodyOptions) => json<T>(context, options)
        , text: (options?: GetRawBodyOptions) => text(context, options)
        , buffer: (options?: GetRawBodyOptions) => buffer(context, options)
    }
}

export function toStringOrBuffer() {
    // avoid to read multiple times same stream object
    const rawBodyCache: RawBodyCacheMapString = new WeakMap()
    return (context: Context, { limit = defaultBodySizeLimit, encoding }: GetRawBodyOptions = {}): Promise<Buffer | string> => {
        const body = rawBodyCache.get(context.req)
        const type = context.req.headers['content-type'] ?? 'text/plain'
        const length = context.req.headers['content-length']

        if (body) return Promise.resolve(body)
        if (encoding === undefined) {
            const parameters = contentType.parse(type)?.parameters
            return parseBody({
                context
                , limit
                , length
                , encoding: parameters?.charset
                , rawBodyCache
            })
        }

        return parseBody({
            context
            , limit
            , length
            , encoding
            , rawBodyCache
        })
    }
}

export function toBuffer() {
    // avoid to read multiple times same stream object
    const rawBodyCache: RawBodyCacheMapBuffer = new WeakMap()
    return (context: Context, { limit = defaultBodySizeLimit, encoding }: GetRawBodyOptions = {}): Promise<Buffer> => {
        const body = rawBodyCache.get(context.req)
        const type = context.req.headers['content-type'] ?? 'application/octet-stream'
        const length = context.req.headers['content-length']

        if (body) return Promise.resolve(body)
        if (encoding === undefined) {
            const parameters = contentType.parse(type)?.parameters
            return getRawBodyBuffer({
                context
                , limit
                , length
                , encoding: parameters?.charset
                , rawBodyCache
            })
        }

        return getRawBodyBuffer({
            context
            , limit
            , length
            , encoding
            , rawBodyCache
        })
    }
}

export function toJson() {
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

