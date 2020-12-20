import { IncomingMessage } from 'http'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import getRawBody, { RawBodyError, Encoding as GetRawBodyEncoding } from 'raw-body'

type ParseBodyOptions = {
    context: Context
    , limit: string | number
    , length: string
    , encoding: getRawBody.Encoding
    , rawBodyCache: WeakMap<IncomingMessage, unknown>
}

type ParseBufferOptions = {
    context: Context
    limit: string | number
    length: string
    encoding: GetRawBodyEncoding
    rawBodyCache: RawBodyCacheMapBuffer
}

export type RawBodyCacheMapBuffer = WeakMap<IncomingMessage, Buffer>

export const getRawBodyBuffer = async ({
    context
    , limit
    , length
    , encoding
    , rawBodyCache
}: ParseBufferOptions): Promise<Buffer> => {
    const body = await parseBody({
        context
        , limit
        , length
        , encoding
        , rawBodyCache
    })

    if (Buffer.isBuffer(body)) return body
    throw createError(500, 'Body must be typeof Buffer')
}

export const parseBody = ({
    context
    , limit
    , length
    , encoding
    , rawBodyCache
}: ParseBodyOptions): Promise<Buffer | string> => getRawBody(context.req, {
    limit
    , length
    , encoding
})
    .then((rawBody: Buffer | string) => {
        rawBodyCache.set(context.req, rawBody)
        return rawBody
    })
    .catch((err: RawBodyError) => {
        if (err.type === 'entity.too.large') {
            throw createError(413, `Body exceeded ${limit} limit`, err)
        }
        throw createError(400, 'Invalid body', err)
    })

