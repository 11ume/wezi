export const NODE_TYPES = {
    STATIC: 0
    , PARAM: 1
    , MATCH_ALL: 2
    , REGEX: 3
    , MULTI_PARAM: 4
}

class Node {
    constructor({
        prefix = '/'
        , children = {}
        , kind = NODE_TYPES.STATIC
        , handler
    } = {}) {
        this.types = NODE_TYPES
        this.prefix = prefix
        this.label = prefix[0]
        this.children = children
        this.numberOfChildren = Object.keys(this.children).length
        this.kind = kind
        this.handler = handler
        this.wildcardChild = null
    }

    getLabel() {
        return this.prefix[0]
    }

    addChild(node) {
        let label = ''
        switch (node.kind) {
            case this.types.STATIC:
                label = node.getLabel()
                break
            case this.types.PARAM:
            case this.types.REGEX:
            case this.types.MULTI_PARAM:
                label = ':'
                break
            case this.types.MATCH_ALL:
                this.wildcardChild = node
                label = '*'
                break
            default:
                throw new Error(`Unknown node kind: ${node.kind}`)
        }

        this.children[label] = node
        this.numberOfChildren = Object.keys(this.children).length

        const iterate = (nod) => {
            if (!nod) {
                return
            }

            if (nod.kind !== this.types.STATIC) {
                return
            }

            const lab = Object.keys(nod.children)
            for (let i = 0; i < lab.length; i++) {
                iterate(nod.children[lab[i]])
            }
        }

        iterate(this)

        return this
    }

    reset(prefix) {
        this.prefix = prefix
        this.children = {}
        this.kind = this.types.STATIC
        this.handler = null
        this.numberOfChildren = 0
        this.wildcardChild = null
        return this
    }

    findByLabel(path) {
        return this.children[path[0]]
    }

    findChild(path) {
        let child = this.children[path[0]]
        if (child !== undefined && (child.numberOfChildren > 0 || child.handler !== null)) {
            if (path.slice(0, child.prefix.length) === child.prefix) {
                return child
            }
        }

        child = this.children[':']
        if (child !== undefined && (child.numberOfChildren > 0 || child.handler !== null)) {
            return child
        }

        child = this.children['*']
        if (child !== undefined && (child.numberOfChildren > 0 || child.handler !== null)) {
            return child
        }

        return null
    }

    setHandler(handler, params) {
        if (!handler) { return }
        this.handler = {
            handler: handler
            , params: params
            , paramsLength: params.length
        }
    }
}

export default Node
