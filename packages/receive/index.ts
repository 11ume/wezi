import { Context } from 'wezi-types'
import { buffer } from './src/streams'
import { parseJSON } from './src/utils'
import { Options as GetRawBodyOptions } from 'raw-body'

export const text = (context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}) => buffer(context, {
    limit
    , encoding
})
    .catch(context.next)

export const json = <T>(context: Context, { limit = '1mb', encoding }: GetRawBodyOptions = {}): Promise<T> => buffer(context, {
    limit
    , encoding
})
    .then((body) => parseJSON(body))
    .catch(context.next)

