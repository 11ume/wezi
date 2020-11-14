import { Stream, Readable } from 'stream'
import { Context } from 'wezi-types'

interface CustomReadable extends Readable {
    _readableState: unknown
}

export const noContentType = (context: Context) => !context.res.getHeader('Content-Type')

export const isEmpty = (obj) => obj === null || obj === undefined

export const isStream = (stream: Stream) => {
    return stream !== null &&
        typeof stream === 'object' &&
        typeof stream.pipe === 'function'
}

export const isReadable = (stream: CustomReadable) => {
    return isStream(stream) &&
        stream.readable !== false &&
        typeof stream._read === 'function' &&
        typeof stream._readableState === 'object'
}
