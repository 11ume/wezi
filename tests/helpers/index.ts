import http from 'http'
import wezi from 'wezi'
import listen from 'test-listen'
import { ComposerHandler, Handler, ErrorHandler } from 'wezi-types'

export function server(...handlers: (ComposerHandler | Handler)[]): Promise<string>
export function server(...handlers: any[]) {
    const w = wezi(...handlers)
    const run = w()
    return listen(http.createServer(run))
}

export function serverError(errorHandler: ErrorHandler, ...handlers: (ComposerHandler | Handler)[]): Promise<string>
export function serverError(errorHandler: ErrorHandler, ...handlers: any[]) {
    const w = wezi(...handlers)
    const run = w(errorHandler)
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
