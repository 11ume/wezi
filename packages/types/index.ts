import { IncomingMessage, ServerResponse } from 'http'
import { HttpError } from 'wezi-error'

export type ErrorHandler = (c: Context) => void
export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly next: NextFunction
    readonly nextError: NextErrorFunction
    readonly error: HttpError
    readonly errorHandler: ErrorHandler
}

export type NextErrorFunction = (err?: HttpError) => void
export type NextFunction = <T>(val: T) => void
export type Handler = (c: Context) => any