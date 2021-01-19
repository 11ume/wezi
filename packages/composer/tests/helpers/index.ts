import http, { RequestListener } from 'http'
import listen from 'test-listen'
import { Context } from 'wezi-types'

export const server = (handler: RequestListener) => {
    return listen(http.createServer(handler))
}

export const createContext = ({
    req
    , res
    , next = null
    , panic = null
    , body = null
    , actions = null
}): Context => ({
    req
    , res
    , next
    , panic
    , body
    , actions
})
