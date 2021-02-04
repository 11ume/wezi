import http, { RequestListener } from 'http'
import listen from 'test-listen'
import { Context } from 'wezi-types'

export const server = (handler: RequestListener) => listen(http.createServer(handler))
export const createContext = ({
    req
    , res
    , next = null
    , panic = null
}): Context => ({
    req
    , res
    , next
    , panic
})
