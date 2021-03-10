import { Context } from 'wezi-types'
import querystring from 'querystring'

type Dict<T> = {
    [K in keyof T]: T[K]
}

const getQuery = (url: string, index: number, sep?: string, eq?: string): any => {
    const search = url.substring(index)
    const path = search.substring(1)
    return querystring.parse(path, sep, eq)
}

const getQueryString = <T>(url: string, sep?: string, eq?: string): Partial<Dict<T>> => {
    const index = url.indexOf('?', 1)
    if (index !== -1) return getQuery(url, index, sep, eq)
    return {}
}

export const queryParser = <T>(context: Context, sep?: string, eq?: string): Partial<Dict<T>> => getQueryString(context.req.url, sep, eq)

