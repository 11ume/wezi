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

// raw body return a string encoded when charset param is defined in the Content-type header or when encoding option is passed.
const forceToBuffer = (body: string | Buffer) => Buffer.isBuffer(body) ? body : Buffer.from(body)

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

    return forceToBuffer(body)
}
