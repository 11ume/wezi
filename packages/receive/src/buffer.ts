import { IncomingMessage } from 'http'
import { Context } from 'wezi-types'
import createError from 'wezi-error'
import getRawBody, { RawBodyError } from 'raw-body'

// Maps requests to buffered raw bodies so that
// multiple calls to `json` work as expected
export const rawBodyMap: WeakMap<IncomingMessage, string> = new WeakMap()

type ParseBody = {
    context: Context
    , length: string
    , limit: string | number
    , encoding: getRawBody.Encoding
}

export const parseBody = ({ context, length, limit, encoding }: ParseBody) => getRawBody(context.req, {
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

