import { IncomingMessage, ServerResponse } from 'http'
import { Send } from 'wezi-send'

export type ErrorHandler = (context: Context, error: Error) => void
export type Redirect = (location: string) => void
export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly send: Send
    readonly next: Next
    readonly panic: Panic
    readonly redirect: Redirect
    readonly errorHandler: ErrorHandler
}

export type Next = <T>(payload?: T) => void
export type Panic = (error: Error) => void
export type Handler = (context: Context, payload?: any) => any
