import { IncomingMessage, ServerResponse } from 'http'
import { HttpError } from 'wezi-error'

export type ErrorHandler = (context: Context, payload?) => void
export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly next: NextFunction
    readonly error: HttpError
    readonly errorHandler: ErrorHandler
}

export type NextFunction = <T>(payload?: T) => void
export type Handler = (context: Context, payload?) => unknown
