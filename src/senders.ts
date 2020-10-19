import { Stream, Readable } from 'stream'
import { isDev, isReadable } from 'utils'
import { Context } from 'application'
import { ErrorObj } from 'error'

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

export const send = <T>(ctx: Context
    , statusCode = 200
    , obj: T = null) => {
    ctx.res.statusCode = statusCode
    if (obj === null) {
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

export const sendError = (ctx: Context, error: ErrorObj) => {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal Server Error'
    const payload = isDev() ? error.stack : message
    send(ctx, statusCode, payload)
}
