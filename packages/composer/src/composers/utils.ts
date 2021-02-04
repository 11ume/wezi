export const isPromise = (value: Partial<Promise<unknown>>): boolean => typeof value.then === 'function'

