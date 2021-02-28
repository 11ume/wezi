import { Readable } from 'stream'
import { Context } from 'wezi-types'

export const stream = (context: Context, payload: Readable, statusCode = 200): void => {
    const type = context.res.getHeader('Content-Type')
    const contentType = type || 'application/octet-stream'

    context.res.statusCode = statusCode
    context.res.writeHead(statusCode, {
        'Content-Type': contentType
    })

    payload.pipe(context.res)
}

export const buffer = (context: Context, payload: Buffer, statusCode = 200): void => {
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
