import { Context } from 'wezi-types'
import { parseJSON } from './utils'
import { rawBodyMap, parseBody } from './buffer'
import { Options as GetRawBodyOptions } from 'raw-body'
import contentType from 'content-type'

export const text = (context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => buffer(context, {
    limit
    , encoding
})
    .then((body) => body.toString())

export const json = <T>(context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}): Promise<T> => buffer(context, {
    limit
    , encoding
})
    .then((body) => {
        const str = body.toString()
        return parseJSON(str)
    })


export const buffer = (context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => {
    const body = rawBodyMap.get(context.req)
    const type = context.req.headers['content-type'] || 'text/plain'
    const length = context.req.headers['content-length']
    if (body) return Promise.resolve(body)
    if (encoding === undefined) {
        const parameters = contentType.parse(type)?.parameters
        return parseBody({ context, length, limit, encoding: parameters?.charset })
    }

    return parseBody({ context, length, limit, encoding })
}
