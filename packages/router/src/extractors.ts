import { RouteEntity } from './router'

type Params = {
    [key: string]: string
}

const regExpExtractParams = (keys: string[], match: RegExpExecArray) => {
    let i = 0
    const params: Params = {}
    while (i < keys.length) {
        const key = keys[i]
        params[key] = match[++i] || null
    }

    return params
}

export const getUrlParams = (routerEntity: RouteEntity, match: RegExpExecArray) => {
    if (routerEntity.keys.length) return regExpExtractParams(routerEntity.keys, match)
    return null
}
