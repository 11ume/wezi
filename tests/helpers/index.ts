import http from 'http'
import listen from 'test-listen'
import wezi from 'wezi'
import { defaultErrorHandler, lazyComposer } from 'wezi-composer'
import { ComposerHandler, Handler, ErrorHandler } from 'wezi-types'

export function server(...handlers: (ComposerHandler | Handler)[]): Promise<string>
export function server(...handlers: any[]) {
    const compose = wezi(...handlers)
    const run = compose(defaultErrorHandler)(lazyComposer)
    return listen(http.createServer(run))
}

export function serverError(errorHandler: ErrorHandler, ...handlers: (ComposerHandler | Handler)[]): Promise<string>
export function serverError(errorHandler: ErrorHandler, ...handlers: any[]) {
    const compose = wezi(...handlers)
    const run = compose(errorHandler)(lazyComposer)
    return listen(http.createServer(run))
}

export const giveMeOneAdress = (portBase: number) => {
    let port = portBase
    return () => {
        port += 1
        return {
            port
            , url: `http://localhost:${port}`
        }
    }
}
