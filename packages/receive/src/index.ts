import { IncomingMessage } from 'http'
import { Context, Body } from 'wezi-types'
import { parseJSON } from './utils'
import fastGetBody from 'fast-get-body'

type CacheWeakMap<T> = WeakMap<IncomingMessage, T>

const toJson = () => {
    const cacheJsonWeakMap: CacheWeakMap<any> = new WeakMap()
    return <T>(context: Context): Promise<T> => {
        const cached = cacheJsonWeakMap.get(context.req)
        if (cached) return Promise.resolve(cached)

        return fastGetBody(context.req, true)
            .then((payload) => {
                const body = parseJSON(payload.body)
                cacheJsonWeakMap.set(context.req, body)
                return body
            })
    }
}

const toBuffer = () => {
    const cacheBufferWeakMap: CacheWeakMap<Buffer> = new WeakMap()
    return (context: Context) => fastGetBody(context.req)
        .then((payload) => {
            const cached = cacheBufferWeakMap.get(context.req)
            if (cached) return cached

            cacheBufferWeakMap.set(context.req, payload.body)
            return payload.body
        })
}

const toText = () => {
    const cacheStringWeakMap: CacheWeakMap<string> = new WeakMap()
    return (context: Context): Promise<string> => fastGetBody(context.req, true)
        .then((payload) => {
            const cached = cacheStringWeakMap.get(context.req)
            if (cached) return cached

            cacheStringWeakMap.set(context.req, payload.body)
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
