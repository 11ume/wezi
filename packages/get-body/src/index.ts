import { Readable } from 'stream'
import createError from 'wezi-error'

type Data<T> = {
    body: T
    received: number
}

type Payload<T> = {
    body: T
    length: number
}

type Resolve<T> = (value: T) => void
type Reject = (err: Error) => void

const onEnd = <T>(data: Data<T>, resolve: Resolve<Payload<T>>, reject: Reject) => (error?: Error) => {
    if (error) {
        const err = createError(400, `request error on read body end, received: ${data.received}`, error)
        reject(err)
        return
    }

    resolve({
        body: data.body
        , length: data.received
    })
}

const onError = <T>(data: Data<T>, reject: Reject) => (error: Error) => {
    const err = createError(400, `request error on read body, received: ${data.received}`, error)
    reject(err)
}

const onAborted = <T>(data: Data<T>, reject: Reject) => () => {
    const err = createError(400, `request error on read body abort, received: ${data.received}`)
    reject(err)
}

const getBodyBuffer = (readable: Readable) => new Promise((resolve, reject) => {
    const data = {
        body: Buffer.from('')
        , received: 0
    }

    const onData = (chunk: Buffer) => {
        data.received += chunk.length
        data.body = Buffer.concat([data.body, chunk])
    }

    const cleanup = () => {
        readable.off('close', cleanup)
        readable.off('data', onData)
        readable.off('end', onEnd(data, resolve, reject))
        readable.off('error', onError(data, reject))
        readable.off('aborted', onAborted(data, reject))
    }

    readable.on('close', cleanup)
    readable.on('data', onData)
    readable.on('end', onEnd(data, resolve, reject))
    readable.on('error', onError(data, reject))
    readable.on('aborted', onAborted(data, reject))
})

const getBodyString = (readable: Readable) => new Promise((resolve, reject) => {
    const data = {
        body: ''
        , received: 0
    }

    const onData = (chunk: string) => {
        data.received += chunk.length
        data.body = data.body += chunk
    }

    const cleanup = () => {
        readable.off('close', cleanup)
        readable.off('data', onData)
        readable.off('end', onEnd(data, resolve, reject))
        readable.off('error', onError(data, reject))
        readable.off('aborted', onAborted(data, reject))
    }

    readable.setEncoding('utf8')
    readable.on('close', cleanup)
    readable.on('data', onData)
    readable.on('end', onEnd(data, resolve, reject))
    readable.on('error', onError(data, reject))
    readable.on('aborted', onAborted(data, reject))
})

export function getBody(readable: Readable, raw?: false): Promise<Payload<string>>
export function getBody(readable: Readable, raw?: true): Promise<Payload<Buffer>>
export function getBody(readable: Readable, raw?: boolean) {
    if (raw) return getBodyBuffer(readable)
    return getBodyString(readable)
}
