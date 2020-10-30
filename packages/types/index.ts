import { IncomingMessage, ServerResponse } from 'http'
import { HttpError } from 'wezi-error'

export type ErrorHandler = (ctx: Context, next?: NextFunction) => void
export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly errorHandler: ErrorHandler
    error?: HttpError
}

export type NextFunction = (err?: HttpError) => void
export type Handler = (ctx: Context, next?: NextFunction) => any