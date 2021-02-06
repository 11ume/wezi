import http from 'http'
import listen from 'test-listen'
import wezi from 'wezi'
import { ErrorHandler, defaultErrorHandler, lazyComposer } from 'wezi-composer'
import { ComposerHandler, Handler } from 'wezi-types'

export function server(...handlers: (ComposerHandler | Handler)[]): Promise<string>
export function server(...handlers: any[]) {
    const compose = wezi(defaultErrorHandler, ...handlers)
    const run = compose(lazyComposer)
    return listen(http.createServer(run))
}

export function serverError(errorHandler: ErrorHandler, ...handlers: (ComposerHandler | Handler)[]): Promise<string>
export function serverError(errorHandler: ErrorHandler, ...handlers: any[]) {
    const compose = wezi(errorHandler, ...handlers)
    const run = compose(lazyComposer)
    return listen(http.createServer(run))
}

