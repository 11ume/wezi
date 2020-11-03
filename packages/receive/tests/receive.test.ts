import test from 'ava'
import http, { IncomingMessage, ServerResponse } from 'http'
import { json, buffer } from '..'
import { Context } from 'wezi-types'
import listen from 'test-listen'
import fetch from 'node-fetch'

const server = (fn: (req: IncomingMessage, res: ServerResponse) => void) => {
    return listen(http.createServer(fn))
}

const createContext = (req: IncomingMessage, res: ServerResponse = null): Context => {
    return {
        req
        , res
        , next: null
        , error: null
        , errorHandler: null
    }
}

test('json should throw 400 on empty body with no headers', async t => {
    const fn = async (req: IncomingMessage) => json(createContext(req))
    const url = await server(fn)

    const res = await fetch(url)
    const body = await res.text()
    t.is(body, 'Invalid JSON')
    t.is(res.status, 400)
})

test('buffer should throw 400 on invalid encoding', async t => {
    const fn = async (req: IncomingMessage) => buffer(createContext(req), { encoding: 'lol' })
    const url = await server(fn)

    const res = await fetch(url, {
        method: 'POST',
        body: '❤️'
    })
    const body = await res.text()
    t.is(body, 'Invalid body')
    t.is(res.status, 400)
})

test('buffer works', async t => {
    const fn = async (req: IncomingMessage) => buffer(createContext(req))
    const url = await server(fn)

    const res = await fetch(url, { method: 'POST', body: '❤️' })
    const body = await res.text()
    t.is(body, '❤️')
})

// test('Content-Type header for JSON is set', async t => {
//     const url = await server(() => ({}))
//     const res = await fetch(url)

//     t.is(res.headers.get('content-type'), 'application/json charset=utf-8')
// })