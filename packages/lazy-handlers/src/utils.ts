export const isPromise = (obj: any) => typeof obj.then === 'function'
export const isProduction = () => process.env.NODE_ENV === 'production'

