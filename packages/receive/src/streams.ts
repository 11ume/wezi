import { IncomingMessage } from 'http'
import { Context } from 'wezi-types'
import createError from 'wezi-error'
import contentType from 'content-type'
import getRawBody, { Options as GetRawBodyOptions, RawBodyError } from 'raw-body'

// Maps requests to buffered raw bodies so that
// multiple calls to `json` work as expected
const rawBodyMap: WeakMap<IncomingMessage, string> = new WeakMap()

type ParseBody = {
    context: Context
    , length: string
    , limit: string | number
    , encoding: getRawBody.Encoding
}

const parseBody = ({ context, length, limit, encoding }: ParseBody) => getRawBody(context.req, {
    limit
    , length
    , encoding
})
    .then((buf) => {
        rawBodyMap.set(context.req, buf)
        return buf
    })
    .catch((err: RawBodyError) => {
        if (err.type === 'entity.too.large') {
            throw createError(413, `Body exceeded ${limit} limit`, err)
        }
        throw createError(400, 'Invalid body', err)
    })

export const buffer = (context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => {
    const body = rawBodyMap.get(context.req)
    const type = context.req.headers['content-type'] || 'text/plain'
    const length = context.req.headers['content-length']
    if (body) return Promise.resolve(body)
    if (encoding === undefined) {
        const { parameters } = contentType.parse(type)
        return parseBody({ context, length, limit, encoding: parameters.charset })
    }

    return parseBody({ context, length, limit, encoding })
}
