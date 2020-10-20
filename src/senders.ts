import { Stream, Readable } from 'stream'
import { isReadable } from 'utils'
import { Context } from 'application'

export const noContentType = (ctx: Context) => !ctx.res.getHeader('Content-Type')

export const sendBuffer = (ctx: Context, obj: Buffer) => {
    if (Buffer.isBuffer(obj)) {
        if (noContentType(ctx)) {
            ctx.res.setHeader('Content-Type', 'application/octet-stream')
        }

        ctx.res.setHeader('Content-Length', obj.length)
        ctx.res.end(obj)
        return
    }

    ctx.res.end()
}

export const sendStream = (ctx: Context, obj: Readable) => {
    if (obj instanceof Stream || isReadable(obj)) {
        if (noContentType(ctx)) {
            ctx.res.setHeader('Content-Type', 'application/octet-stream')
        }

        obj.pipe(ctx.res)
        return
    }

    ctx.res.end()
}

export const send = <T>(ctx: Context, statusCode = 200, obj?: T) => {
    ctx.res.statusCode = statusCode
    if (!obj) {
        ctx.res.end()
        return
    }

    const payload = JSON.stringify(obj)
    if (noContentType(ctx)) {
        ctx.res.setHeader('Content-Type', 'application/json charset=utf-8')
    }

    ctx.res.setHeader('Content-Length', Buffer.byteLength(payload))
    ctx.res.end(payload)
}
