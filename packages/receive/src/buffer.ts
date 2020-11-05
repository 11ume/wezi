import { Context } from 'wezi-types'
import createError from 'wezi-error'
import getRawBody, { RawBodyError } from 'raw-body'

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
    .catch((err: RawBodyError) => {
        if (err.type === 'entity.too.large') {
            throw createError(413, `Body exceeded ${limit} limit`, err)
        }
        throw createError(400, 'Invalid body', err)
    })

