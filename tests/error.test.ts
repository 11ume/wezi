import test from 'ava'
import http from 'http'
import listen from 'test-listen'
import fetch from 'node-fetch'
import wezi from '../packages/wezi'
import { Handler } from '../packages/types'
import createError from '../packages/error'

const server = (...fns: Handler[]) => {
    const app = wezi(...fns)
    return listen(http.createServer(app()))
}

test('create and return http error', async (t) => {
    const url = await server(() => createError(420, ''))
    const res = await fetch(url)
    t.is(res.status, 420)
})
