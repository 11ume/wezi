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

const toBuffer = (weakMap: CacheWeakMap<Buffer>) => {
    return (context: Context): Promise<Buffer> => handleGetBody<Buffer>(context, weakMap, async () => {
        const payload = await getBody(context.req, true)
        weakMap.set(context.req, payload.body)
        return payload.body
    })
}

const toJson = (weakMap: CacheWeakMap<any>) => {
    return <T>(context: Context): Promise<T> => handleGetBody<T>(context, weakMap, async () => {
        const payload = await getBody(context.req, false)
        const body = parseJSON<T>(payload.body)
        weakMap.set(context.req, body)
        return body
    })
}

const toText = (weakMap: CacheWeakMap<string>) => {
    return (context: Context): Promise<string> => handleGetBody<string>(context, weakMap, async () => {
        const payload = await getBody(context.req, false)
        weakMap.set(context.req, payload.body)
        return payload.body
    })
}

const weakmap = new WeakMap()
export const text = toText(weakmap)
export const json = toJson(weakmap)
export const buffer = toBuffer(weakmap)

