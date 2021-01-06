import http, { RequestListener } from 'http'
import listen from 'test-listen'
import { Context } from 'wezi-types'

export const server = (handler: RequestListener) => {
    return listen(http.createServer(handler))
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
