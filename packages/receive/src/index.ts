import { IncomingMessage } from 'http'
import fastGetBody from 'fast-get-body'
import { Context, Body } from 'wezi-types'
import { parseJSON } from './utils'

type CacheWeakMap<T = any> = WeakMap<IncomingMessage, T>
type FastGetJsonBody<T> = () => Promise<T>

const handleGetBody = <T = void>(context: Context, weakMap: CacheWeakMap<T>, fn: FastGetJsonBody<T>) => {
    const body = weakMap.get(context.req)
    if (body) return Promise.resolve(body)
    return fn()
}

const toJson = () => {
    const weakMap: CacheWeakMap = new WeakMap()
    return <T>(context: Context) => handleGetBody<T>(context, weakMap, async () => {
        const payload = await fastGetBody(context.req, true)
        const body = parseJSON(payload.body)
        weakMap.set(context.req, body)
        return body
    })
}

const toBuffer = () => {
    const weakMap: CacheWeakMap<Buffer> = new WeakMap()
    return (context: Context) => handleGetBody<Buffer>(context, weakMap, async () => {
        const payload = await fastGetBody(context.req)
        weakMap.set(context.req, payload.body)
        return payload.body
    })
}

const toText = () => {
    const weakMap: CacheWeakMap<string> = new WeakMap()
    return (context: Context) => handleGetBody<string>(context, weakMap, async () => {
        const payload = await fastGetBody(context.req, true)
        weakMap.set(context.req, payload.body)
        return payload.body
    })
}

export const text = toText()
export const json = toJson()
export const buffer = toBuffer()

export const body = (context: Context): Body => {
    return {
        text: () => text(context)
        , json: <T>() => json<T>(context)
        , buffer: () => buffer(context)
    }
}
