import isPlainObject from 'is-plain-obj'
import { Stream, Readable } from 'stream'

interface ReadableWhitState extends Readable {
    _readableState: any
}

const isStream = (stream: Stream) => {
    return stream !== null &&
	typeof stream === 'object' &&
	typeof stream.pipe === 'function'
}

export const isJsonable = (payload: any) => isPlainObject(payload) || Array.isArray(payload)
export const isReadable = (stream: ReadableWhitState) => {
    return isStream(stream) &&
	stream.readable !== false &&
	typeof stream._read === 'function' &&
	typeof stream._readableState === 'object'
}

