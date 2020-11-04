import { Context } from 'wezi-types'

export const isDev = () => process.env.NODE_ENV === 'development'
export const status = (context: Context, statusCode: number) => {
    context.res.statusCode = statusCode
}
