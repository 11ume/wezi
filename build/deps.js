export default (deps = {}) => {
    const dependencyKey = Object.keys(deps)
    return [
        ...dependencyKey
        , 'http'
        , 'stream'
    ]
}
