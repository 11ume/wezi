import test from 'ava'
import http from 'http'
import listen from 'test-listen'
import fetch from 'node-fetch'
import wezi from '../packages/wezi'
import { Handler } from '../packages/types'
import createError from '../packages/error'

type ErrorPayload = {
    message: string
}

const server = (...fns: Handler[]) => {
    const app = wezi(...fns)
    return listen(http.createServer(app()))
}

test('create and return http error', async (t) => {
    const url = await server(() => createError(420))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()
    t.is(res.status, 420)
    t.is(body.message, 'Enhance Your Calm')
})

test('create and return http error whit custom status code and message', async (t) => {
    const url = await server(() => createError(418, 'Im a teapot'))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()
    t.is(res.status, 418)
    t.is(body.message, 'Im a teapot')
})
