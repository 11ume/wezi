import http, { RequestListener } from 'http'
import listen from 'test-listen'
import { Context } from 'wezi-types'

export const server = (handler: RequestListener) => {
    return listen(http.createServer(handler))
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
