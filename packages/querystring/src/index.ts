import { Context } from 'wezi-types'
import querystring, { ParsedUrlQuery } from 'querystring'

interface QueryContext extends Context {
    query?: ParsedUrlQuery
}

const getQuery = (url: string, idx: number) => {
    const search = url.substring(idx)
    const path = search.substring(1)
    const query = querystring.parse(path)
    return query
}

const getQueryString = (url: string) => {
    const index = url.indexOf('?', 1)
    if (index !== -1) return getQuery(url, index)
    return null
}

export const queryParser = (context: QueryContext) => {
    const query = getQueryString(context.req.url)
    context.query = query
    context.next()
}
