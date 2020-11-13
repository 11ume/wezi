import { Stream, Readable } from 'stream'
import { isReadable } from './utils'
import { Context } from 'wezi-types'

const noContentType = (context: Context) => !context.res.getHeader('Content-Type')

const sendJson = (context: Context, obj) => {
    const str = JSON.stringify(obj)
    if (noContentType(context)) {
        context.res.setHeader('Content-Type', 'application/json charset=utf-8')
    }

    context.res.setHeader('Content-Length', Buffer.byteLength(str))
    context.res.end(str)
}

const sendText = (context: Context, obj) => {
    if (noContentType(context)) {
        context.res.setHeader('Content-Type', 'text/plain')
    }

    context.res.setHeader('Content-Length', Buffer.byteLength(obj))
    context.res.end(obj)
}

const sendEmpty = (context: Context, statusCode: number) => {
    context.res.statusCode = statusCode ?? 204
    context.res.end()
}

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
    context.res.statusCode = statusCode ?? 200
    if (obj instanceof Stream || isReadable(obj)) {
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/octet-stream')
        }

        obj.pipe(context.res)
        return
    }

    context.res.end()
}

const isEmpty = (obj) => obj === null || obj === undefined

export const send = (context: Context, statusCode?: number, obj?) => {
    if (isEmpty(obj)) {
        sendEmpty(context, statusCode)
        return
    }

    context.res.statusCode = statusCode ?? 200
    if (typeof obj === 'object' || typeof obj === 'number') {
        sendJson(context, obj)
        return
    }

    sendText(context, obj)
}
