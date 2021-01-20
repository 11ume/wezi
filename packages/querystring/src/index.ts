import { Context } from 'wezi-types'
import querystring from 'querystring'

type Query = {
    [key: string]: string | string[]
}

const getQuery = <T = Query>(url: string, index: number, sep?: string, eq?: string): T => {
    const search = url.substring(index)
    const path = search.substring(1)
    return querystring.parse(path, sep, eq) as any
}

const getQueryString = <T = Query>(url: string, sep?: string, eq?: string): T => {
    const index = url.indexOf('?', 1)
    if (index !== -1) return getQuery(url, index, sep, eq)
    return null
}

export const queryParser = <T = Query>(context: Context, sep?: string, eq?: string): T => getQueryString(context.req.url, sep, eq)
