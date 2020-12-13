import { IncomingMessage, ServerResponse } from 'http'
import { Send } from 'wezi-send'
import { Get } from 'wezi-receive'
import { Actions } from 'wezi-actions'

export type ErrorHandler = (context: Context, error: Error) => void
export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly next: Next
    readonly panic: Panic
    readonly get: Get
    readonly send: Send
    readonly actions: Actions
    readonly errorHandler: ErrorHandler
}

export type Next = <T>(payload?: T) => void
export type Panic = (error: Error) => void
export type Handler = (context: Context, payload?: any) => any
