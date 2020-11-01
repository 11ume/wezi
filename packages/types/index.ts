import { IncomingMessage, ServerResponse } from 'http'
import { HttpError } from 'wezi-error'

export type ErrorHandler = <T>(context: Context, ...values: T[]) => void
export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly next: NextFunction
    readonly error: HttpError
    readonly errorHandler: ErrorHandler
}

export type NextFunction = (...values: any[]) => void
export type Handler = <T>(context: Context, ...values: T[]) => any