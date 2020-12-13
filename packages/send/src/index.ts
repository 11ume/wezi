import { Stream, Readable } from 'stream'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import { isEmpty, isJsonable, noContentType } from './utils'

export interface Send {
    json: <T>(payload: T, statusCode?: number) => void
    text: (payload: string | number, statusCode?: number) => void
    empty: (statusCode?: number) => void
    stream: (payload: Readable, statusCode?: number) => void
    buffer: (payload: Buffer, statusCode?: number) => void
}

export const createSend = (context: Context): Send => {
    return {
        json: <T>(payload: T, statusCode?: number) => json(context, payload, statusCode)
        , text: (payload: string | number, statusCode?: number) => text(context, payload, statusCode)
        , empty: (statusCode?: number) => empty(context, statusCode)
        , buffer: (payload: Buffer, statusCode?: number) => buffer(context, statusCode, payload)
        , stream: (payload: Readable, statusCode?: number) => stream(context, statusCode, payload)
    }
}

export const buffer = (context: Context, statusCode: number, payload: Buffer) => {
    context.res.statusCode = statusCode ?? 200
    if (Buffer.isBuffer(payload)) {
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/octet-stream')
        }

        context.res.setHeader('Content-Length', payload.length)
        context.res.end(payload)
        return
    }

    context.panic(createError(500, 'buffer payload must be a instance of Buffer'))
}

export const stream = (context: Context, statusCode: number, payload: Readable) => {
    context.res.statusCode = statusCode ?? 200
    if (payload instanceof Stream) {
        if (noContentType(context)) {
            context.res.setHeader('Content-Type', 'application/octet-stream')
        }

        payload.pipe(context.res)
        return
    }

    context.panic(createError(500, 'stream payload must be a instance of Stream'))
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

export const send = (context: Context, statusCode?: number, payload?: any) => {
    if (isEmpty(payload)) {
        return empty(context, statusCode)
    }

    if (isJsonable(payload)) {
        return json(context, payload, statusCode)
    }

    return text(context, payload, statusCode)
}
