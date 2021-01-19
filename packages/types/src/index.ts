import { IncomingMessage, ServerResponse } from 'http'

export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly next: Next
    readonly panic: Panic
}

export type Shared<E> = {
    set: <T extends E, K extends keyof T>(key: K, value: T[K]) => void
    get: <T extends E, K extends keyof T>(key: K) => T[K]
    remove: <T extends E, K extends keyof T>(key: K) => void
    values: () => E
}

export type Next = <T>(payload?: T) => void
export type Panic = (error: Error) => void
export type Handler = (context: Context, payload?: any) => any
export type ErrorHandler = (context: Context, error: Error) => void
export type Dispatch = (context: Context, payload?: unknown) => void
