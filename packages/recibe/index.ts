import { Context } from 'wezi-types'
import { parseJSON } from './src/utils'
import createError from 'wezi-error'
import contentType from 'content-type'
import getRawBody, { Options as GetRawBodyOptions, RawBodyError } from 'raw-body'

// Maps requests to buffered raw bodies so that
// multiple calls to `json` work as expected
const rawBodyMap = new WeakMap()

export const buffer = (ctx: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => {
    const body = rawBodyMap.get(ctx.req)
    const type = ctx.req.headers['content-type'] || 'text/plain'
    const length = ctx.req.headers['content-length']
    let encode = encoding

    if (encoding === undefined) {
        encode = contentType.parse(type).parameters.charset
    }

    if (body) {
        return body
    }

    return getRawBody(ctx.req, {
        limit
        , length
        , encoding: encode
    })
        .then((buf) => {
            rawBodyMap.set(ctx.req, buf)
            return buf
        })
        .catch((err: RawBodyError) => {
            if (err.type === 'entity.too.large') {
                throw createError(413, `Body exceeded ${limit} limit`, err)
            } else {
                throw createError(400, 'Invalid body', err)
            }
        })
}

export const text = (ctx: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => buffer(ctx, {
    limit
    , encoding
})
    .then((body) => body.toString(encoding))

export const json = <T>(ctx: Context, opts?: GetRawBodyOptions): Promise<T> => text(ctx, opts)
    .then((body: string) => parseJSON(body))
