import { Stream, Readable } from 'stream'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import { isEmpty, isJsonable } from './utils'

export const buffer = (context: Context, statusCode = 200, payload: Buffer) => {
    const contentType = context.res.getHeader('Content-Type')
    if (Buffer.isBuffer(payload)) {
        context.res.writeHead(statusCode, {
            'Content-Type': contentType || 'application/octet-stream'
            , 'Content-Length': payload.length
        })

        context.res.end(payload, null, null)
        return
    }

    context.panic(createError(500, 'buffer payload must be a instance of Buffer'))
}

export const stream = (context: Context, statusCode = 200, payload: Readable) => {
    context.res.statusCode = statusCode
    const contentType = context.res.getHeader('Content-Type')
    if (payload instanceof Stream) {
        context.res.writeHead(statusCode, {
            'Content-Type': contentType || 'application/octet-stream'
        })
        payload.pipe(context.res)
        return
    }

    context.panic(createError(500, 'stream payload must be a instance of Stream'))
}

export const json = <T = void>(context: Context, payload: T, statusCode = 200) => {
    const payloadStr = JSON.stringify(payload)
    const contentType = context.res.getHeader('Content-Type')
    context.res.writeHead(statusCode, {
        'Content-Type': contentType || 'application/json charset=utf-8'
        , 'Content-Length': Buffer.byteLength(payloadStr)
    })
    context.res.end(payloadStr, null, null)
}

export const text = (context: Context, payload: string | number, statusCode = 200) => {
    const payloadStr = typeof payload === 'number' ? payload.toString() : payload
    const contentType = context.res.getHeader('Content-Type')
    context.res.writeHead(statusCode, {
        'Content-Type': contentType || 'text/plain charset=utf-8'
        , 'Content-Length': Buffer.byteLength(payloadStr)
    })
    context.res.end(payloadStr, null, null)
}

export const empty = (context: Context, statusCode = 204) => {
    context.res.writeHead(statusCode)
    context.res.end(null, null, null)
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
