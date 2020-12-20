import { IncomingMessage } from 'http'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import rawBody, { RawBodyError, Encoding as GetRawBodyEncoding } from 'raw-body'

type ParseBodyOptions = {
    context: Context
    , limit: string | number
    , length: string
    , encoding: rawBody.Encoding
    , rawBodyCache: WeakMap<IncomingMessage, unknown>
}

type ParseBufferOptions = {
    context: Context
    limit: string | number
    length: string
    encoding: GetRawBodyEncoding
    rawBodyCache: WeakMap<IncomingMessage, Buffer>
}

export const getRawBodyBuffer = async ({
    context
    , limit
    , length
    , encoding
    , rawBodyCache
}: ParseBufferOptions): Promise<Buffer> => {
    const body = await getRawBody({
        context
        , limit
        , length
        , encoding
        , rawBodyCache
    })

    if (Buffer.isBuffer(body)) return body
    throw createError(500, 'Body must be typeof Buffer')
}

export const getRawBody = ({
    context
    , limit
    , length
    , encoding
    , rawBodyCache
}: ParseBodyOptions): Promise<Buffer | string> => rawBody(context.req, {
    limit
    , length
    , encoding
})
    .then((body: Buffer | string) => {
        rawBodyCache.set(context.req, body)
        return body
    })
    .catch((err: RawBodyError) => {
        if (err.type === 'entity.too.large') {
            throw createError(413, `Body exceeded ${limit} limit`, err)
        }
        throw createError(400, 'Invalid body', err)
    })

