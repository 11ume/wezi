import { Context } from 'wezi-types'

export const isProd = () => process.env.NODE_ENV === 'production'
export const status = (context: Context, statusCode: number) => {
    context.res.statusCode = statusCode
}
