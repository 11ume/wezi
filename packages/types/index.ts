import { IncomingMessage, ServerResponse } from 'http'
import { HttpError } from 'wezi-error'

export type ErrorHandler = (c: Context) => void
export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly next: NextFunction
    readonly errorHandler: ErrorHandler
    readonly error: HttpError
}

export type NextFunction = (err?: HttpError) => void
export type Handler = (c: Context) => any