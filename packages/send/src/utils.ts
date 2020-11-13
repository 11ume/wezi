import { Stream, Readable } from 'stream'
import { Context } from 'wezi-types'

export const noContentType = (context: Context) => !context.res.getHeader('Content-Type')

export const isEmpty = (obj) => obj === null || obj === undefined

export const isStream = (stream: Stream) => {
    return stream !== null &&
        typeof stream === 'object' &&
        typeof stream.pipe === 'function'
}

export const isReadable = (stream: Readable) => {
    return isStream(stream) &&
        stream.readable !== false &&
        typeof stream._read === 'function'
}
