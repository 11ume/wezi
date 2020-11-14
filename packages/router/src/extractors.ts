import queryString from 'querystring'
import { Route, RouteEntity } from './router'

const regExpExtractParams = (route: Route, match: RegExpExecArray) => {
    let i = 0
    const params = {}
    while (i < route.keys.length) {
        const key = route.keys[i]
        params[key] = match[++i] || null
    }

    return params
}

const checkQuery = (url: string) => {
    const index = url.indexOf('?', 1)
    const isQuery = index !== -1
    return {
        index
        , isQuery
    }
}

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

export const getUrlParams = (item: RouteEntity, match: RegExpExecArray) => match
    ? regExpExtractParams(item.route, match)
    : {}

export const getUrlQuery = (baseUrl: string) => {
    const cq = checkQuery(baseUrl)
    if (cq.isQuery) return getQueryString(baseUrl, cq.index)
    return {
        query: {}
        , pathname: null
    }
}

