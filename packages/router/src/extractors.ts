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

export const getUrlParams = (entity: RouteEntity, match: RegExpExecArray) => {
    if (entity.params) return regExpExtractParams(entity.keys, match)
    return null
}
