import { Context, Actions } from 'wezi-types'

export const createActions = (context: Context): Actions => {
    return {
        redirect: (location: string) => redirect(context, location)
    }
}

export const redirect = (context: Context, location: string) => {
    context.res.statusCode = 301
    context.res.setHeader('Location', location)
    context.res.end()
}
