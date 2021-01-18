export const isPromise = (value: Partial<Promise<unknown>>): boolean => typeof value.then === 'function'
export const isProduction = (): boolean => process.env.NODE_ENV === 'production'

