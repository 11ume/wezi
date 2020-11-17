export const isObject = <T>(obj: T) => obj && typeof obj === 'object'
export const isError = <T>(err: T) => err && err instanceof Error
