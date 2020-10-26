import { IncomingMessage, ServerResponse } from 'http'
import { ErrorObj } from 'wuok-error'

export type ErrorHandler = (ctx: Context, next?: NextFunction) => void
export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly errorHandler: ErrorHandler
    error?: ErrorObj
}

export type NextFunction = (err?: ErrorObj) => void
export type Handler = (ctx: Context, next?: NextFunction) => any