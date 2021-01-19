import { IncomingMessage } from 'http'
import { Context } from 'wezi-types'
import createError from 'wezi-error'

type SharedWeakMap = WeakMap<IncomingMessage, any>

const set = <E>(context: Context, weakmap: SharedWeakMap) => <T extends E, K extends keyof T>(key: K, value: T[K]): void => {
    const obj = weakmap.get(context.req)
    if (obj) {
        obj[key] = value
        return
    }

    weakmap.set(context.req, {
        [key]: value
    })
}

const get = <E>(context: Context, weakmap: SharedWeakMap) => <T extends E, K extends keyof T>(key: K): T[K] => {
    const obj = weakmap.get(context.req)
    if (key in obj) return obj[key]
    throw createError(500, `get sharable value error, key: ${key} don't exists`)
}

const remove = <E>(context: Context, weakmap: SharedWeakMap) => <T extends E, K extends keyof T>(key: K): void => {
    const obj = weakmap.get(context.req)
    if (key in obj) {
        delete obj[key]
        weakmap.set(context.req, obj)
        return
    }

    throw createError(500, `remove sharable value error, key: ${key} don't exists`)
}

const values = <E>(context: Context, weakmap: SharedWeakMap) => (): E => weakmap.get(context.req)

export const weakmap = new WeakMap<IncomingMessage>()

export const shared = <E>(context: Context) => {
    return {
        set: set<E>(context, weakmap)
        , get: get<E>(context, weakmap)
        , remove: remove<E>(context, weakmap)
        , values: values<E>(context, weakmap)
    }
}

