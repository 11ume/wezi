import { IncomingMessage } from 'http'
import { Context } from 'wezi-types'
import { parseJSON } from './utils'
import { parseBody } from './buffer'
import { Options as GetRawBodyOptions } from 'raw-body'
import contentType from 'content-type'

export const cacheJson: WeakMap<IncomingMessage, unknown> = new WeakMap()

export const text = (context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => buffer(context, {
    limit
    , encoding
})
    .then((body) => body.toString())

export const json = <T>(context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}): Promise<T> => buffer(context, {
    limit
    , encoding
})
    .then((rawBody) => {
        const cached = cacheJson.get(context.req)
        if (cached) {
            return cached
        }

        const str = rawBody.toString()
        const body = parseJSON(str)
        cacheJson.set(context.req, body)
        return body
    })

export const buffer = (context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => {
    const body = cacheJson.get(context.req)
    const type = context.req.headers['content-type'] || 'text/plain'
    const length = context.req.headers['content-length']
    if (body) return Promise.resolve(body)
    if (encoding === undefined) {
        const parameters = contentType.parse(type)?.parameters
        return parseBody({
            context, length, limit, encoding: parameters?.charset
        })
    }

    return parseBody({
        context, length, limit, encoding
    })
}
