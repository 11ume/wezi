import { Context } from 'wezi-types'
import createError from 'wezi-error'

type SharableKey = string | number | symbol

const setSharableValue = (obj: unknown, key: SharableKey, value: unknown, options: PropertyDescriptor = {}) => {
    const { value: _, ...opts } = options
    return Object.defineProperties(obj, {
        [key]: {
            value
            , writable: true
            , ...opts
        }
    })
}

export const shared = <E>(c: Context) => {
    const weakmap = new WeakMap()
    const map = weakmap.set(c.req, {})
    return {
        values: (): E => map.get(c.req)
        , set: <T extends E, K extends keyof T>(key: K, value: T[K], options?: PropertyDescriptor) => {
            const obj = map.get(c.req)
            try {
                setSharableValue(obj, key, value, options)
            } catch (err) {
                throw createError(500, `set sharable value error, key: ${key}`, err)
            }
        }
        , get: <T extends E, K extends keyof T>(key: K): T[K] => {
            const obj = weakmap.get(c.req)
            if (key in obj) {
                return obj[key]
            }

            throw createError(500, `get sharable value error, key: ${key} dont exist`)
        }
        , remove: <T extends E, K extends keyof T>(key: K) => {
            const obj = map.get(c.req)
            const newObj = {
                ...obj
            }

            if (key in obj) {
                delete newObj[key]
                map.set(c.req, newObj)
                return
            }

            throw createError(500, `remove sharable value error, dont exist key: ${key}`)
        }
    }
}
