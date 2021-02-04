export class InternalError extends Error {
    readonly code: number
    readonly message: string
    readonly originalError: Error
    constructor(message: string, code?: number, originalError?: Error) {
        super(message)
        this.code = code
        this.originalError = originalError
    }
}

export const createError = (code: number, message?: string, error?: Error): InternalError => new InternalError(message, code, error)
