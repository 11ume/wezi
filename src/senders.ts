import { ServerResponse } from 'http'
import { Stream, Readable } from 'stream'
import { isDev, isReadable, ErrorObj } from 'utils'

export const noContentType = (res: ServerResponse) => !res.getHeader('Content-Type')

export const sendBuffer = (res: ServerResponse, obj: Buffer) => {
    if (Buffer.isBuffer(obj)) {
        if (noContentType(res)) {
            res.setHeader('Content-Type', 'application/octet-stream')
        }

        res.setHeader('Content-Length', obj.length)
        res.end(obj)
        return
    }

    res.end()
}

export const sendStream = (res: ServerResponse, obj: Readable) => {
    if (obj instanceof Stream || isReadable(obj)) {
        if (noContentType(res)) {
            res.setHeader('Content-Type', 'application/octet-stream')
        }

        obj.pipe(res)
        return
    }

    res.end()
}

export const send = <T>(res: ServerResponse
    , statusCode = 200
    , obj: T = null) => {
    res.statusCode = statusCode

    if (obj === null) {
        res.end()
    }

    const payload = JSON.stringify(obj)
    if (noContentType(res)) {
        res.setHeader('Content-Type', 'application/json charset=utf-8')
    }

    res.setHeader('Content-Length', Buffer.byteLength(payload))
    res.end(payload)
}

export const sendError = (res: ServerResponse, errorObj: ErrorObj) => {
    const statusCode = errorObj.statusCode || 500
    const message = errorObj.message || 'Internal Server Error'
    const payload = isDev() ? errorObj.stack : message
    send(res, statusCode, payload)
}
