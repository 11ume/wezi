export class InternalError extends Error {
    readonly message: string
    readonly statusCode: number
    readonly originalError: Error
    constructor(message: string, statusCode?: number, originalError?: Error) {
        super(message)
        this.statusCode = statusCode
        this.originalError = originalError
    }
}

export const createError = (statusCode: number, message?: string, error?: Error): InternalError => new InternalError(message, statusCode, error)
