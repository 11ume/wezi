import { Stream, Readable } from 'stream'
import { isReadable } from './utils'
import { Context } from 'wezi-types'

const noContentType = (context: Context) => !context.res.getHeader('Content-Type')

export const buffer = (context: Context, statusCode = 200, obj: Buffer) => {
    context.res.statusCode = statusCode
    if (Buffer.isBuffer(obj)) {
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/octet-stream')
        }

        context.res.setHeader('Content-Length', obj.length)
        context.res.end(obj)
        return
    }

    context.res.end()
}

export const stream = (context: Context, statusCode = 200, obj: Readable) => {
    context.res.statusCode = statusCode
    if (obj instanceof Stream || isReadable(obj)) {
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/octet-stream')
        }

        obj.pipe(context.res)
        return
    }

    context.res.end()
}

export const send = (context: Context, statusCode = 200, obj = null) => {
    context.res.statusCode = statusCode
    if (obj === null) {
        context.res.end()
        return
    }

    let payload = obj
    if (typeof obj === 'object' || typeof obj === 'number') {
        payload = JSON.stringify(obj)
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/json charset=utf-8')
        }

        context.res.setHeader('Content-Length', Buffer.byteLength(payload))
    }

    context.res.end(payload)
}

