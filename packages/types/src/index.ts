import { IncomingMessage, ServerResponse } from 'http'
import { Body } from './receive'
import { Actions } from './actions'

export interface Context<T = any> {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly body: Body
    readonly next: Next
    readonly panic: Panic
    readonly status: Status
    readonly actions: Actions
    readonly sharable: Sharable<T>
}

export type Sharable<E> = {
    set: <T extends E, K extends keyof T>(key: K, value: T[K], options?: PropertyDescriptor) => void
    get: <T extends E, K extends keyof T>(key: K) => T[K]
}

export type Payload<T = any> = {
    [key: string]: T
}
export type Next = <T>(payload?: T) => void
export type Panic = (error: Error) => void
export type Status = (code: number, message?: string) => void
export type Handler = (context: Context, payload?: any) => any
export type ErrorHandler = (context: Context, error: Error) => void
export type Dispatch = (context: Context, payload?: unknown) => void
