import { IncomingMessage } from 'http'
import { Context } from 'wezi-types'
import getBody from 'wezi-get-body'
import { parseJSON } from './utils'

type CacheWeakMap<T = any> = WeakMap<IncomingMessage, T>
type FastGetJsonBody<T> = () => Promise<T>

const handleGetBody = <T = void>(context: Context, weakMap: CacheWeakMap<T>, getBodyFn: FastGetJsonBody<T>): Promise<T> => {
    const body = weakMap.get(context.req)
    if (body) return Promise.resolve(body)
    return getBodyFn()
}

const toBuffer = () => {
    const weakMap: CacheWeakMap<Buffer> = new WeakMap()
    return (context: Context): Promise<Buffer> => handleGetBody<Buffer>(context, weakMap, async () => {
        const payload = await getBody(context.req, false)
        weakMap.set(context.req, payload.body)
        return payload.body
    })
}

const toJson = () => {
    const weakMap: CacheWeakMap = new WeakMap()
    return <T>(context: Context): Promise<T> => handleGetBody<T>(context, weakMap, async () => {
        const payload = await getBody(context.req, true)
        const body = parseJSON<T>(payload.body)
        weakMap.set(context.req, body)
        return body
    })
}

const toText = () => {
    const weakMap: CacheWeakMap<string> = new WeakMap()
    return (context: Context): Promise<string> => handleGetBody<string>(context, weakMap, async () => {
        const payload = await getBody(context.req, true)
        weakMap.set(context.req, payload.body)
        return payload.body
    })
}

export const text = toText()
export const json = toJson()
export const buffer = toBuffer()

