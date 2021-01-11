import codes from './codes'

export class InternalError extends Error {
    constructor(
        public readonly message: string
        , public readonly statusCode?: number
        , public readonly originalError?: Error) {
        super(message)
    }
}

export const createError = (status: number, message?: string, error?: Error) => {
    const msg = message || codes[status]
    if (status > 511 || status < 100) {
        throw new Error(`Invalid status code ${status}`)
    }
    return new InternalError(msg, status, error)
}
