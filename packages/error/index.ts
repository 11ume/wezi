import codes from './codes'

export class HttpError extends Error {
    constructor(
        public message: string
        , public statusCode: number
        , public error?: Error) {
        super(message)
        this.message = this.message ? message : codes[statusCode]
    }
}

const createError = (statusCode: number
    , message?: string
    , error?: Error) => {
    const err = new HttpError(message, statusCode, error)
    err.statusCode = statusCode
    err.error = error
    return err
}

export default createError
