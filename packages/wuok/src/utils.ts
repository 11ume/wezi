import { Context, Handler } from 'wuok-types'

export const isDev = () => process.env.NODE_ENV === 'development'
export const status = (ctx: Context, statusCode: number) => ctx.res.statusCode = statusCode
export const mergeHandlers = (handler: Handler | Handler[], handlers: Handler[]) => Array.isArray(handler) ? [...handler, ...handlers] : [handler, ...handlers]
