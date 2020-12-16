import http from 'http'
import listen from 'test-listen'
import wezi from '../../packages/wezi'
import { Handler } from '../../packages/types'

export const server = (...fn: Handler[]) => {
    const w = wezi(...fn)
    return listen(http.createServer(w))
}
