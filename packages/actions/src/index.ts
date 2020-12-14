import { Context, Actions } from 'wezi-types'

export const createActions = (context: Context): Actions => {
    return {
        redirect: (location: string) => redirect(context, location)
    }
}

export const redirect = (context: Context, location: string, statusCode = 301) => {
    context.res.statusCode = statusCode
    context.res.setHeader('Location', location)
    context.res.end()
}
