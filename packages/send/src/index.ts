import { Stream, Readable } from 'stream'
import { Context } from 'wezi-types'
import { isEmpty, isReadable, noContentType } from './utils'

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

export const json = <T = void>(context: Context, payload: T, statusCode?: number) => {
    const payloadStr = JSON.stringify(payload)
    context.res.statusCode = statusCode ?? 200
    if (noContentType(context)) {
        context.res.setHeader('Content-Type', 'application/json charset=utf-8')
    }

    context.res.setHeader('Content-Length', Buffer.byteLength(payloadStr))
    context.res.end(payloadStr)
}

export const text = (context: Context, payload: string | number, statusCode?: number) => {
    const payloadStr = typeof payload === 'number' ? payload.toString() : payload
    context.res.statusCode = statusCode ?? 200
    if (noContentType(context)) {
        context.res.setHeader('Content-Type', 'text/plain charset=utf-8')
    }

    context.res.setHeader('Content-Length', Buffer.byteLength(payloadStr))
    context.res.end(payloadStr)
}

export const empty = (context: Context, statusCode?: number) => {
    context.res.statusCode = statusCode ?? 204
    context.res.end()
}

export const send = (context: Context, statusCode?: number, payload?) => {
    if (isEmpty(payload)) {
        return empty(context, statusCode)
    }

    if (typeof payload === 'object') {
        return json(context, payload, statusCode)
    }

    return text(context, payload, statusCode)
}
