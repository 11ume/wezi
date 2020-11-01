import { Context, Handler } from 'wezi-types'

export const isDev = () => process.env.NODE_ENV === 'development'
export const status = (context: Context, statusCode: number) => context.res.statusCode = statusCode
export const mergeHandlers = (handler: Handler | Handler[], handlers: Handler[]) => Array.isArray(handler) ? [...handler, ...handlers] : [handler, ...handlers]
