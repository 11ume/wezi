type Params = {
    [key: string]: string
}

const extractParams = (keys: string[], match: RegExpExecArray): Params => {
    const params: Params = {}
    for (let i = 0; i < keys.length;) {
        params[keys[i]] = match[++i]
    }

    return params
}

export const getUrlParams = (params: boolean, entityKeys: string[], match: RegExpExecArray): Params | null => {
    if (params) return extractParams(entityKeys, match)
    return null
}
