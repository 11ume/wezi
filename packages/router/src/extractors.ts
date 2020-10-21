import queryString from 'querystring'
import { Route, RouteStackItem } from './index'

// extracts all params of an matched url pattern as key/value
const regExpExtractParams = (route: Route, match: RegExpExecArray) => {
    let i = 0
    const params = {}
    while (i < route.keys.length) {
        const key = route.keys[i]
        params[key] = match[++i] || null
    }

    return params
}

// detect any wildcard of requested url
const checkQuery = (url: string) => {
    const index = url.indexOf('?', 1)
    const isQuery = index !== -1
    return {
        index
        , isQuery
    }
}

// discard the wildcard and get the pathname cleanly, then return a parsed url query
const getQueryString = (url: string, idx: number) => {
    const search = url.substring(idx)
    const path = search.substring(1)
    const pathname = url.substring(0, idx)
    const query = queryString.parse(path)
    return {
        query
        , pathname
    }
}

// parse and extract all url params as key/values
export const getUrlParams = (item: RouteStackItem, match: RegExpExecArray) => match 
    ? regExpExtractParams(item.route, match) 
    : {}

// parse and extract all url query as key/values
export const getUrlQuery = (baseUrl: string) => {
    const cq = checkQuery(baseUrl)
    if (cq.isQuery) return getQueryString(baseUrl, cq.index)
    return {
        query: {}
        , pathname: null
    }
}

