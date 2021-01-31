import { Readable } from 'stream'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import { isJsonable, isReadable } from './utils'

export const stream = (context: Context, statusCode = 200, payload: Readable): void => {
    const type = context.res.getHeader('Content-Type')
    const contentType = type || 'application/octet-stream'

    context.res.statusCode = statusCode
    context.res.writeHead(statusCode, {
        'Content-Type': contentType
    })

    payload.pipe(context.res)
}

export const buffer = (context: Context, statusCode = 200, payload: Buffer): void => {
    const type = context.res.getHeader('Content-Type')
    const contentType = type || 'application/octet-stream'

    context.res.writeHead(statusCode, {
        'Content-Type': contentType
        , 'Content-Length': payload.length
    })

    context.res.end(payload, null, null)
}

export const json = <T = void>(context: Context, payload: T, statusCode = 200): void => {
    const body = JSON.stringify(payload)
    const type = context.res.getHeader('Content-Type')
    const contentType = type || 'application/json charset=utf-8'
    const contentLength = Buffer.byteLength(body)

    context.res.writeHead(statusCode, {
        'Content-Type': contentType
        , 'Content-Length': contentLength
    })

    context.res.end(body, null, null)
}

export const text = (context: Context, payload: string, statusCode = 200): void => {
    const type = context.res.getHeader('Content-Type')
    const contentType = type || 'text/plain charset=utf-8'
    const contentLength = Buffer.byteLength(payload)

    context.res.writeHead(statusCode, {
        'Content-Type': contentType
        , 'Content-Length': contentLength
    })

    context.res.end(payload, null, null)
}

export const empty = (context: Context, statusCode = 204): void => {
    context.res.writeHead(statusCode, {
        'Content-Length': '0'
    })

    context.res.end(null, null, null)
}

export const send = (context: Context, statusCode?: number, payload?: any): void => {
    if (isJsonable(payload)) {
        return json(context, payload, statusCode)
    }

    if (typeof payload === 'string') {
        return text(context, payload, statusCode)
    }

    if (typeof payload === 'number') {
        return text(context, payload.toString(), statusCode)
    }

    if (Buffer.isBuffer(payload)) {
        return buffer(context, statusCode, payload)
    }

    if (isReadable(payload)) {
        return stream(context, statusCode, payload)
    }

    context.panic(createError(500, 'cannot send, payload is not a valid'))
}
