import { Stream, Readable } from 'stream'
import { isReadable } from './utils'
import { Context } from 'wezi-types'

const noContentType = (c: Context) => !c.res.getHeader('Content-Type')

export const buffer = (c: Context, statusCode = 200, obj: Buffer) => {
    c.res.statusCode = statusCode
    if (Buffer.isBuffer(obj)) {
        if (noContentType(c)) {
            c.res.setHeader('Content-Type', 'application/octet-stream')
        }

        c.res.setHeader('Content-Length', obj.length)
        c.res.end(obj)
        return
    }

    c.res.end()
}

export const stream = (c: Context, statusCode = 200, obj: Readable) => {
    c.res.statusCode = statusCode
    if (obj instanceof Stream || isReadable(obj)) {
        if (noContentType(c)) {
            c.res.setHeader('Content-Type', 'application/octet-stream')
        }

        obj.pipe(c.res)
        return
    }

    c.res.end()
}

export const send = (c: Context, statusCode = 200, obj = null) => {
    c.res.statusCode = statusCode
    if (obj === null) {
        c.res.end()
        return
    }

    let payload = obj
    if (typeof obj === 'object' || typeof obj === 'number') {
        payload = JSON.stringify(obj)
        if (noContentType(c)) {
            c.res.setHeader('Content-Type', 'application/json charset=utf-8')
        }

        c.res.setHeader('Content-Length', Buffer.byteLength(payload))
    }

    c.res.end(payload)
}

