import { Context } from 'wezi-types'

export const redirect = (context: Context, location: string, statusCode = 301): void => {
    context.res.statusCode = statusCode
    context.res.setHeader('Location', location)
    context.res.end(null, null, null)
}

