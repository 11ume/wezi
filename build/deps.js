export default (deps = {}) => {
    const dependencyKey = Object.keys(deps)
    return [
        ...dependencyKey
        , 'path'
        , 'http'
        , 'stream'
    ]
}
