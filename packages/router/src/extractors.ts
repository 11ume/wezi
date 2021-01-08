import { Route, RouteEntity } from './router'

type Params = {
    [key: string]: string
}

const regExpExtractParams = (route: Route, match: RegExpExecArray) => {
    let i = 0
    const params: Params = {}
    while (i < route.keys.length) {
        const key = route.keys[i]
        params[key] = match[++i] || null
    }

    return params
}

export const getUrlParams = (item: RouteEntity, match: RegExpExecArray) => match && regExpExtractParams(item.route, match)

