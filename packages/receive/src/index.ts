import { Context } from 'wezi-types'
import { buffer } from './stream'
import { parseJSON } from './utils'
import { Options as GetRawBodyOptions } from 'raw-body'

export const text = (context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => buffer(context, {
    limit
    , encoding
})
    .then((body) => body.toString())
    .catch(context.next)

export const json = <T>(context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}): Promise<T> => buffer(context, {
    limit
    , encoding
})
    .then((body) => {
        const str = body.toString()
        return parseJSON(str)
    })
    .catch(context.next)

