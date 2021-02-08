import { Readable } from 'stream'
import createError from 'wezi-error'

type Payload<T> = {
   body: T
   length: number
}

type Data<T> = {
    body: T
    received: number
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
    const err = createError(400, `request error on read body abort, received: ${data}`)
    reject(err)
}

const getBodyBuffer = (readable: Readable) => new Promise((resolve, reject) => {
    const data = {
        received: 0
        , body: Buffer.from('')
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
    readable.setEncoding('utf8')
    const data = {
        received: 0
        , body: ''
    }

    const onData = (chunk: Buffer) => {
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

    readable.on('close', cleanup)
    readable.on('data', onData)
    readable.on('end', onEnd(data, resolve, reject))
    readable.on('error', onError(data, reject))
    readable.on('aborted', onAborted(data, reject))
})

export function getBody(readable: Readable, str?: true): Promise<Payload<string>>
export function getBody(readable: Readable, str?: false): Promise<Payload<Buffer>>
export function getBody(readable: Readable, str?: boolean) {
    if (str) return getBodyString(readable)
    return getBodyBuffer(readable)
}
