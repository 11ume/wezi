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

type OnData<T> = (data: Data<T>) => (chunk: T) => void
type Resolve<T> = (value: T) => void
type Reject = (err: Error) => void

const bindEvent = <T>(readable: Readable, event: string, fn: (value?: T) => void) => {
    const handler = fn
    readable.on(event, handler)
    return () => {
        readable.off(event, handler)
    }
}

const onEnd = <T>(data: Data<T>, resolve: Resolve<Payload<T>>, reject: Reject) => (error?: Error) => {
    if (error) {
        const err = createError(500, `error on read body end, received: ${data.received}`, error)
        reject(err)
        return
    }

    resolve({
        body: data.body
        , length: data.received
    })
}

const onError = <T>(data: Data<T>, reject: Reject) => (error: Error) => {
    const err = createError(500, `error on read body, received: ${data.received}`, error)
    reject(err)
}

const onAborted = <T>(data: Data<T>, reject: Reject) => () => {
    const err = createError(500, `error on read body abort, received: ${data.received}`)
    reject(err)
}

const onDataBuffer = (data: Data<Buffer>) => (chunk: Buffer) => {
    data.received += chunk.length
    data.body = Buffer.concat([data.body, chunk])
}

const onDataString = (data: Data<string>) => (chunk: string) => {
    data.received += chunk.length
    data.body = data.body += chunk
}

const getRawBody = <T>(readable: Readable, body: T, onData: OnData<T>): Promise<Payload<T>> => new Promise((resolve, reject) => {
    const data = {
        body
        , received: 0
    }

    const unBindEnd = bindEvent(readable, 'end', onEnd(data, resolve, reject))
    const unBindData = bindEvent(readable, 'data', onData(data))
    const unBindError = bindEvent(readable, 'error', onError(data, reject))
    const unBindAborted = bindEvent(readable, 'aborted', onAborted(data, reject))
    const unBindClose = bindEvent(readable, 'close', cleanup)

    function cleanup() {
        unBindEnd()
        unBindData()
        unBindError()
        unBindAborted()
        unBindClose()
    }
})

export function getBody(readable: Readable, raw: false): Promise<Payload<string>>
export function getBody(readable: Readable, raw: true): Promise<Payload<Buffer>>
export function getBody(readable: Readable, raw: boolean) {
    if (raw) return getRawBody<Buffer>(readable, Buffer.from(''), onDataBuffer)
    return getRawBody<string>(readable, '', onDataString)
}
