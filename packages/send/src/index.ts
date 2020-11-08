import { Stream, Readable } from 'stream'
import { isReadable } from './utils'
import { Context } from 'wezi-types'

const noContentType = (context: Context) => !context.res.getHeader('Content-Type')

export const buffer = (context: Context, statusCode: number, obj: Buffer) => {
    context.res.statusCode = statusCode ?? 200
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

export const stream = (context: Context, statusCode: number, obj: Readable) => {
    statusCode ?? 200
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

export const send = (context: Context, statusCode?: number, obj?) => {
    if (obj === null) {
        context.res.statusCode = 204
        context.res.end()
        return
    }

    context.res.statusCode = statusCode ?? 200
    let payload = obj ?? ''
    if (typeof obj === 'object' || typeof obj === 'number') {
        payload = JSON.stringify(obj)
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/json charset=utf-8')
        }
    }

    if (noContentType(context)) {
        context.res.setHeader('Content-Type', 'text/plain')
    }
    context.res.setHeader('Content-Length', Buffer.byteLength(payload))
    context.res.end(payload)
}
