import { Context } from 'wezi-types'

export interface Actions {
    redirect: (location: string) => void
}

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
