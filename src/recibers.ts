import { IncomingMessage } from 'http'
import contentType from 'content-type'
import getRawBody, { Options as GetRawBodyOptions, RawBodyError } from 'raw-body'
import { createError, parseJSON } from 'utils'
import { Context } from 'application'

// Maps requests to buffered raw bodies so that
// multiple calls to `json` work as expected
const rawBodyMap = new WeakMap()

export const buffer = (req: IncomingMessage, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => {
    const body = rawBodyMap.get(req)
    const type = req.headers['content-type'] || 'text/plain'
    const length = req.headers['content-length']
    let encode = encoding

    if (encoding === undefined) {
        encode = contentType.parse(type).parameters.charset
    }

    if (body) {
        return body
    }

    return getRawBody(req, {
        limit
        , length
        , encoding: encode
    })
        .then((buf) => {
            rawBodyMap.set(req, buf)
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

export const text = (ctx: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => buffer(ctx.req, {
    limit
    , encoding
})
    .then((body) => body.toString(encoding))

export const json = <T>(ctx: Context, opts?: GetRawBodyOptions): Promise<T> => text(ctx, opts)
    .then((body: string) => parseJSON(body))
