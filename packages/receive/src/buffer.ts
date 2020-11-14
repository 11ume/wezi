import { IncomingMessage } from 'http'
import { Context } from 'wezi-types'
import createError from 'wezi-error'
import getRawBody, { RawBodyError } from 'raw-body'

type ParseBody = {
    context: Context
    , limit: string | number
    , length: string
    , encoding: getRawBody.Encoding
    , rawBodyCache: WeakMap<IncomingMessage, unknown>
}

export const parseBody = ({
    context
    , limit
    , length
    , encoding
    , rawBodyCache
}: ParseBody) => getRawBody(context.req, {
    limit
    , length
    , encoding
})
    .then((rawBody) => {
        rawBodyCache.set(context.req, rawBody)
        return rawBody
    })
    .catch((err: RawBodyError) => {
        if (err.type === 'entity.too.large') {
            throw createError(413, `Body exceeded ${limit} limit`, err)
        }
        throw createError(400, 'Invalid body', err)
    })

