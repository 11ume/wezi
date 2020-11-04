import test from 'ava'
import http from 'http'
import listen from 'test-listen'
import fetch from 'node-fetch'
import wezi from '../packages/wezi'
import cors from '../packages/cors'
import { Handler } from '../packages/types'

const server = (...fns: Handler[]) => {
    const app = wezi(...fns)
    return listen(http.createServer(app()))
}

const methods = [
    'POST'
    , 'GET'
    , 'PUT'
    , 'PATCH'
    , 'DELETE'
    , 'OPTIONS'
]

test('adds default max age header only for OPTIONS request', async (t) => {
    const url = await server(cors(), () => null)
    for (const method of methods) {
        const res = await fetch(url, {
            method: 'OPTIONS'
        })
        if (method === 'OPTIONS') {
            const maxAgeHeader = res.headers.get('Access-Control-Max-Age')
            t.deepEqual(maxAgeHeader, '86400')
        } else {
            t.falsy(Object.keys(res.headers).includes('Access-Control-Max-Age'))
        }
    }
})
