import { IncomingMessage, ServerResponse } from 'http'
import { Body } from './receive'
import { Actions } from './actions'

export interface Context {
    readonly req: IncomingMessage
    readonly res: ServerResponse
    readonly body: Body
    readonly next: Next
    readonly panic: Panic
    readonly status: Status
    readonly actions: Actions
}

export type Next = <T>(payload?: T) => void
export type Panic = (error: Error) => void
export type Status = (code: number, message?: string) => void
export type Handler = (context: Context, payload?: any) => any
export type ErrorHandler = (context: Context, error: Error) => void
export type Dispatch = (context: Context, payload?: unknown) => void
