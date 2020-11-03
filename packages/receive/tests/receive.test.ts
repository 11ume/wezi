import test from 'ava'
import http from 'http'
import wezi from 'wezi'
import { Handler, Context } from 'wezi-types'
import listen from 'test-listen'
import fetch from 'node-fetch'
import { json, buffer } from '..'

const server = (fn: Handler) => {
    const app = wezi(fn)
    return listen(http.createServer(app()))
}

test('json should throw 400 on empty body with no headers', async (t) => {
    const fn = async (c: Context) => json(c)
    const url = await server(fn)

    const res = await fetch(url)
    const body = await res.text()
    t.is(body, 'Invalid JSON')
    t.is(res.status, 400)
})

test('buffer should throw 400 on invalid encoding', async t => {
    const fn = async (c: Context)  => buffer(c, { encoding: 'lol' })
    const url = await server(fn)

    const res = await fetch(url, {
        method: 'POST',
        body: 'foo'
    })
    const body = await res.text()
    t.is(body, 'Invalid body')
    t.is(res.status, 400)
})

test('buffer works', async t => {
    const fn = async (c: Context) => buffer(c)
    const url = await server(fn)

    const res = await fetch(url, { method: 'POST', body: 'foo' })
    const body = await res.text()
    t.is(body, 'foo')
})

test('Content-Type header for JSON is set', async t => {
    const url = await server(() => ({}))
    const res = await fetch(url)

    t.is(res.headers.get('content-type'), 'application/json charset=utf-8')
})