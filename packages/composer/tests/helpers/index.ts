import http, { IncomingMessage, ServerResponse } from 'http'
import listen from 'test-listen'
import { Context } from 'wezi-types'

export const server = (fn: (req: IncomingMessage, res: ServerResponse) => void) => {
    return listen(http.createServer((req, res) => fn(req, res)))
}

export const createContext = ({
    req
    , res
    , body = null
    , next = null
    , panic = null
    , status = null
    , actions = null
}): Context => ({
    req
    , res
    , body
    , next
    , panic
    , status
    , actions
})
