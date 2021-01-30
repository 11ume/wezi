import http from 'http'
import listen from 'test-listen'
import wezi from '../../packages/wezi'
import { lazy } from '../../packages/composer'

type Handler = (...args: any[])=> any

export const server = (...fn: Handler[]) => {
    const w = wezi(...fn)
    return listen(http.createServer(w(lazy)))
}

