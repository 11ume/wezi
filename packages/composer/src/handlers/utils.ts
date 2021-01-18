export const isPromise = (obj: any): boolean => typeof obj.then === 'function'
export const isProduction = (): boolean => process.env.NODE_ENV === 'production'

