import http, { IncomingMessage, ServerResponse } from 'http'
import listen from 'test-listen'
import { Context } from 'wezi-types'

export const server = (fn: (req: IncomingMessage, res: ServerResponse) => void) => {
    return listen(http.createServer((req, res) => fn(req, res)))
}

export const createContext = ({
    req
    , res
    , query = {}
    , params = {}
    , body = null
    , next = null
    , panic = null
    , status = null
    , shared = null
    , actions = null
}): Context => ({
    req
    , res
    , query
    , params
    , body
    , next
    , panic
    , status
    , shared
    , actions
})
