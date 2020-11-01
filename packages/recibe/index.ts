import { parseJSON } from './src/utils'
import { Context } from 'wezi-types'
import createError from 'wezi-error'
import contentType from 'content-type'
import getRawBody, { Options as GetRawBodyOptions, RawBodyError } from 'raw-body'

// Maps requests to buffered raw bodies so that
// multiple calls to `json` work as expected
const rawBodyMap = new WeakMap()

export const buffer = (context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => {
    const body = rawBodyMap.get(context.req)
    const type = context.req.headers['content-type'] || 'text/plain'
    const length = context.req.headers['content-length']
    let encode = encoding

    if (encoding === undefined) {
        encode = contentType.parse(type).parameters.charset
    }

    if (body) {
        return body
    }

    return getRawBody(context.req, {
        limit
        , length
        , encoding: encode
    })
        .then((buf) => {
            rawBodyMap.set(context.req, buf)
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

export const text = (context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => buffer(context, {
    limit
    , encoding
})
    .then((body) => body.toString(encoding))

export const json = <T>(context: Context, opts?: GetRawBodyOptions): Promise<T> => text(context, opts)
    .then((body: string) => parseJSON(body))
