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
    readonly shared: T
    readonly query: any
    readonly params: any
}

export type Next = <T>(payload?: T) => void
export type Panic = (error: Error) => void
export type Status = (code: number) => void
export type Handler = (context: Context, payload?: any) => any
export type ErrorHandler = (context: Context, error: Error) => void
export type Wezi<S = any> = (initialShared?: S, errorHandler?: Handler) => (req: IncomingMessage, res: ServerResponse) => void
