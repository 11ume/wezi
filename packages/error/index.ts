import codes from './codes'

export class HttpError extends Error {
    constructor(
        public message: string
        , public statusCode: number
        , public originalError?: Error) {
        super(message)
    }
}

const createError = (status: number, message?: string, error?: Error) => {
    const msg = message || codes[status]
    if (status > 511 || status < 100) {
        throw Error(`Invalid status code ${status}`)
    }
    return new HttpError(msg, status, error)
}

export const error = (err: Error, message?: string) => createError(500, message, err)

export default createError
