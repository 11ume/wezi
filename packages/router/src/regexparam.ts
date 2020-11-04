const regexparam = (path: string, loose?: string) => {
    let c = ''
    let optional = 0
    let ext = 0
    let tmp = ''
    let pattern = ''
    const keys: string[] = []
    const arr = path.split('/')
    arr[0] || arr.shift()

    // eslint-disable-next-line no-cond-assign
    while (tmp = arr.shift()) {
        c = tmp[0]
        if (c === '*') {
            keys.push('wild')
            pattern += '/(.*)'
        } else if (c === ':') {
            optional = tmp.indexOf('?', 1)
            ext = tmp.indexOf('.', 1)
            keys.push(tmp.substring(1, ~optional ? optional : ~ext ? ext : tmp.length))
            pattern += !!~optional && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)'
            if (~ext) pattern += (~optional ? '?' : '') + '\\' + tmp.substring(ext)
        } else {
            pattern += '/' + tmp
        }
    }

    return {
        keys
        , pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i')
    }
}

export default regexparam
