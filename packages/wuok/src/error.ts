export class ErrorObj extends Error {
    constructor(
		public message: string
		, public statusCode: number
		, public error?: Error) {
        super()
    }
}

export const createError = (statusCode: number
    , message: string
    , error?: Error) => {
    const err = new ErrorObj(message, statusCode, error)
    err.statusCode = statusCode
    err.error = error
    return err
}
