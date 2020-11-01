import { parseJSON } from './src/utils'
import { Context } from 'wezi-types'
import createError from 'wezi-error'
import contentType from 'content-type'
import getRawBody, { Options as GetRawBodyOptions, RawBodyError } from 'raw-body'

// Maps requests to buffered raw bodies so that
// multiple calls to `json` work as expected
const rawBodyMap = new WeakMap()

export const buffer = (c: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => {
    const body = rawBodyMap.get(c.req)
    const type = c.req.headers['content-type'] || 'text/plain'
    const length = c.req.headers['content-length']
    let encode = encoding

    if (encoding === undefined) {
        encode = contentType.parse(type).parameters.charset
    }

    if (body) {
        return body
    }

    return getRawBody(c.req, {
        limit
        , length
        , encoding: encode
    })
        .then((buf) => {
            rawBodyMap.set(c.req, buf)
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

export const text = (c: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => buffer(c, {
    limit
    , encoding
})
    .then((body) => body.toString(encoding))

export const json = <T>(c: Context, opts?: GetRawBodyOptions): Promise<T> => text(c, opts)
    .then((body: string) => parseJSON(body))
