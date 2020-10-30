import codes from './codes'

export class HttpError extends Error {
    constructor(
        public message: string
        , public statusCode: number
        , public error?: Error) {
        super()
        this.message = this.message ?? codes[statusCode]
    }
}

export const createError = (statusCode: number
    , message = ''
    , error?: Error) => {
    const err = new HttpError(message, statusCode, error)
    err.statusCode = statusCode
    err.error = error
    return err
}
