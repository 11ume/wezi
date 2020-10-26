import { Stream, Readable } from 'stream'

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