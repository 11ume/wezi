import { RouteEntity } from './router'

type Params = {
    [key: string]: string
}

const extractParams = (keys: string[], match: RegExpExecArray) => {
    const params: Params = {}
    for (let i = 0; i < keys.length;) {
        params[keys[i]] = match[++i]
    }

    return params
}

export const getUrlParams = (entity: RouteEntity, match: RegExpExecArray) => {
    if (entity.params) return extractParams(entity.keys, match)
    return null
}
