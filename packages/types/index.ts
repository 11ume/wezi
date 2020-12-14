import { IncomingMessage, ServerResponse } from 'http'
import { Options as GetRawBodyOptions } from 'raw-body'
import { Readable } from 'stream'

export interface Actions {
    redirect: (location: string) => void
}

export interface Send {
    ok: (message?: string) => void
    empty: (statusCode?: number) => void
    json: <T>(statusCode: number, payload: T) => void
    text: (statusCode: number, payload: string | number) => void
    stream: (statusCode: number, payload: Readable) => void
    buffer: (statusCode: number, payload: Buffer) => void
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
