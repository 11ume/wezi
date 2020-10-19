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
    , original?: Error) => {
    const err = new ErrorObj(message, statusCode, original)
    err.statusCode = statusCode
    err.originalError = original
    return err
}
