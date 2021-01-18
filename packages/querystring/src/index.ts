import { Context } from 'wezi-types'
import querystring, { ParsedUrlQuery } from 'querystring'

export type Payload<P = void, Q = void> = {
    query: Q
    params: P
}

type Dictionary = {
    [key: string]: string
}

const getQuery = (url: string, idx: number): ParsedUrlQuery => {
    const search = url.substring(idx)
    const path = search.substring(1)
    const query = querystring.parse(path)
    return query
}

const getQueryString = (url: string): ParsedUrlQuery | null => {
    const index = url.indexOf('?', 1)
    if (index !== -1) return getQuery(url, index)
    return null
}

export const queryParser = (context: Context, params: Dictionary): void => {
    const query = getQueryString(context.req.url)
    context.next({
        params
        , query
    })
}
