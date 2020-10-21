const regexparam = (str: string, loose?: string) => {
    let c = ''
    let o = 0
    let tmp = ''
    let ext = 0
    const keys = []
    let pattern = ''
    const arr = str.split('/')
    arr[0] || arr.shift()

    // eslint-disable-next-line no-cond-assign
    while (tmp = arr.shift()) {
        c = tmp[0]
        if (c === '*') {
            keys.push('wild')
            pattern += '/(.*)'
        } else if (c === ':') {
            o = tmp.indexOf('?', 1)
            ext = tmp.indexOf('.', 1)
            keys.push(tmp.substring(1, ~o ? o : ~ext ? ext : tmp.length))
            pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)'
            if (~ext) pattern += (~o ? '?' : '') + '\\' + tmp.substring(ext)
        } else {
            pattern += '/' + tmp
        }
    }

    return {
        keys: keys
        , pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i')
    }
}

export default regexparam
