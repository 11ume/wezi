import { IncomingMessage, ServerResponse } from 'http'
import { Options as GetRawBodyOptions } from 'raw-body'
import { Readable } from 'stream'

export interface Actions {
    redirect: (location: string) => void
}

export interface Send {
    json: <T>(payload: T, statusCode?: number) => void
    text: (payload: string | number, statusCode?: number) => void
    empty: (statusCode?: number) => void
    stream: (payload: Readable, statusCode?: number) => void
    buffer: (payload: Buffer, statusCode?: number) => void
}

export interface Receive {
    json: <T>(options?: GetRawBodyOptions) => Promise<T>
    text: (options?: GetRawBodyOptions) => Promise<string>
    buffer: (options?: GetRawBodyOptions) => Promise<string>
}

export type ErrorHandler = (context: Context, error: Error) => void
export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly next: Next
    readonly panic: Panic
    readonly send: Send
    readonly receive: Receive
    readonly actions: Actions
    readonly errorHandler: ErrorHandler
}

export type Next = <T>(payload?: T) => void
export type Panic = (error: Error) => void
export type Handler = (context: Context, payload?: any) => any
