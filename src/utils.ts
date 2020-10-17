import { Stream, Readable } from 'stream'

export class ErrorObj extends Error {
    constructor(
		public message: string
		, public statusCode: number
		, public originalError: Error) {
        super()
    }
}

export const createError = (statusCode: number
    , message: string
    , original: Error) => {
    const err = new ErrorObj(message, statusCode, original)
    err.statusCode = statusCode
    err.originalError = original
    return err
}

export const isDev = () => process.env.NODE_ENV === 'development'

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

export const parseJSON = (str: string) => {
    try {
        return JSON.parse(str)
    } catch (err) {
        throw createError(400, 'Invalid JSON', err)
    }
}
