import { IncomingMessage, ServerResponse } from 'http'
import { ErrorObj } from 'wuok-error'

export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    error?: ErrorObj
}

export type NextFunction = (err?: ErrorObj) => void
export type Handler = (ctx: Context, next?: NextFunction) => any