import { Stream, Readable } from 'stream'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import { isJsonable } from './utils'

export const stream = (context: Context, statusCode = 200, payload: Readable) => {
    context.res.statusCode = statusCode
    if (payload instanceof Stream) {
        context.res.writeHead(statusCode, {
            'Content-Type': 'application/octet-stream'
        })
        payload.pipe(context.res)
        return
    }

    context.panic(createError(500, 'stream payload must be a instance of Stream'))
}

export const buffer = (context: Context, statusCode = 200, payload: Buffer) => {
    const type = context.res.getHeader('Content-Type')
    const contentType = type || 'application/json charset=utf-8'

    if (Buffer.isBuffer(payload)) {
        context.res.writeHead(statusCode, {
            'Content-Type': contentType
            , 'Content-Length': payload.length
        })

        context.res.end(payload, null, null)
        return
    }

    context.panic(createError(500, 'buffer payload must be a instance of Buffer'))
}

export const json = <T = void>(context: Context, payload: T, statusCode = 200) => {
    const chunk = JSON.stringify(payload)
    const type = context.res.getHeader('Content-Type')
    const contentType = type || 'application/json charset=utf-8'
    const contentlength = Buffer.byteLength(chunk)

    context.res.writeHead(statusCode, {
        'Content-Type': contentType
        , 'Content-Length': contentlength
    })
    context.res.end(chunk, null, null)
}

export const text = (context: Context, payload: string | number, statusCode = 200) => {
    const chunk = typeof payload === 'number' ? payload.toString() : payload
    const type = context.res.getHeader('Content-Type')
    const contentType = type || 'text/plain charset=utf-8'
    const contentlength = Buffer.byteLength(chunk)

    context.res.writeHead(statusCode, {
        'Content-Type': contentType
        , 'Content-Length': contentlength
    })
    context.res.end(chunk, null, null)
}

export const empty = (context: Context, statusCode = 204) => {
    context.res.writeHead(statusCode, {
        'Content-Length': '0'
    })
    context.res.end(null, null, null)
}

export const send = (context: Context, statusCode?: number, payload?: any) => {
    if (isJsonable(payload)) {
        return json(context, payload, statusCode)
    }

    return text(context, payload, statusCode)
}
