import http from 'http'
import wezi from 'wezi'
import listen from 'test-listen'
import { Router, Handler, ErrorHandler } from 'wezi-types'

export function server(...handlers: Handler[]) {
    const w = wezi(...handlers)
    return listen(http.createServer(w()))
}

export function serverRouter(router: Router, ...handlers: Handler[]) {
    const w = wezi(...handlers)
    return listen(http.createServer(w(router)))
}

export function serverError(errorHandler: ErrorHandler, ...handlers: Handler[]) {
    const w = wezi(...handlers)
    return listen(http.createServer(w(undefined, errorHandler)))
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
