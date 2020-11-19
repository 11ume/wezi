import { Context } from 'wezi-types'
import isPlainObject from 'is-plain-obj'

export const noContentType = (context: Context) => !context.res.getHeader('Content-Type')

export const isEmpty = (obj: any) => obj === null || obj === undefined

export const isJsonable = (payload: any) => isPlainObject(payload) || Array.isArray(payload)
