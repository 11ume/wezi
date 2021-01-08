import isPlainObject from 'is-plain-obj'

export const isEmpty = (obj: any) => obj === null || obj === undefined
export const isJsonable = (payload: any) => isPlainObject(payload) || Array.isArray(payload)
