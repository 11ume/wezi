import { Context, Actions } from 'wezi-types'

export const redirect = (context: Context, location: string, statusCode = 301): void => {
    context.res.statusCode = statusCode
    context.res.setHeader('Location', location)
    context.res.end(null, null, null)
}

export const actions = (context: Context): Actions => {
    return {
        redirect: (location: string) => redirect(context, location)
    }
}

