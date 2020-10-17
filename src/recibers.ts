import { IncomingMessage } from 'http'
import contentType from 'content-type'
import getRawBody, { Options as GetRawBodyOptions } from 'raw-body'
import { createError, parseJSON } from 'utils'

// Maps requests to buffered raw bodies so that
// multiple calls to `json` work as expected
const rawBodyMap = new WeakMap()

export const buffer = (req: IncomingMessage, { limit = '1mb', encoding = null }: GetRawBodyOptions = {}) => {
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
        .then(buf => {
            rawBodyMap.set(req, buf)
            return buf
        })
        .catch(err => {
            if (err.type === 'entity.too.large') {
                throw createError(413, `Body exceeded ${limit} limit`, err)
            } else {
                throw createError(400, 'Invalid body', err)
            }
        })
}

export const text = (req: IncomingMessage, { limit = '1mb', encoding = null }: GetRawBodyOptions = {}) => buffer(req, {
    limit
    , encoding
})
    .then(body => body.toString(encoding))

export const json = (req: IncomingMessage, opts: GetRawBodyOptions) => text(req, opts)
    .then(body => parseJSON(body))
