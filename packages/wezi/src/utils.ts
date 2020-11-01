import { Context, Handler } from 'wezi-types'

export const isDev = () => process.env.NODE_ENV === 'development'
export const status = (c: Context, statusCode: number) => c.res.statusCode = statusCode
export const mergeHandlers = (handler: Handler | Handler[], handlers: Handler[]) => Array.isArray(handler) ? [...handler, ...handlers] : [handler, ...handlers]
