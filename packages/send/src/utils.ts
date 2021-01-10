import isPlainObject from 'is-plain-obj'

export const isJsonable = (payload: any) => isPlainObject(payload) || Array.isArray(payload)
