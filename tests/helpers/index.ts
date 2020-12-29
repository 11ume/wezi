import http from 'http'
import listen from 'test-listen'
import wezi from '../../packages/wezi'
import { Handler } from '../../packages/types'
import { ErrorHandler } from 'wezi-types'

export const server = (...fn: Handler[]) => {
    const w = wezi(...fn)
    return listen(http.createServer(w()))
}

export const serverError = (errorHandler: ErrorHandler, ...fn: Handler[]) => {
    const w = wezi(...fn)
    return listen(http.createServer(w(null, errorHandler)))
}
