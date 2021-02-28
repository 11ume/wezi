import test from 'ava'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import { Context } from 'wezi-types'
import * as send from 'wezi-send'
import * as receive from 'wezi-receive'
import { server } from './helpers'

test('receive json', async (t) => {
    type Character = {
        name: string
    }

    const chars: Character[] = [
        {
            name: 't800'
        }
        , {
            name: 'John Connor'
        }
    ]

    const fn = async (c: Context) => {
        const body = await receive.json<Character[]>(c)
        send.json(c, body)
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: JSON.stringify(chars)
    })

    const body: Character[] = await res.json()

    t.is(res.headers.get('content-type'), 'application/json charset=utf-8')
    t.is(body[0].name, 't800')
    t.is(body[1].name, 'John Connor')
})

test('json parse error', async (t) => {
    const fn = async (c: Context) => {
        const body = await receive.json(c)
        send.json(c, body)
    }

    const url = await server(fn)
    const { status } = await fetch(url, {
        method: 'POST'
        , body: '{ "bad json" }'
        , headers: {
            'Content-Type': 'application/json'
        }
    })

    t.is(status, 400)
})

test('receive buffer', async (t) => {
    const fn = async (c: Context) => {
        const body = await receive.buffer(c)
        t.true(Buffer.isBuffer(body))
        send.buffer(c, body)
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: Buffer.from('foo')
    })

    const body = await res.text()

    t.is(res.headers.get('content-type'), 'application/octet-stream')
    t.is(body, 'foo')
})

test('receive text', async (t) => {
    const fn = async (c: Context) => {
        const body = await receive.text(c)
        t.true(typeof body === 'string')
        send.text(c, body)
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: 'foo im a grizzly bear'
    })

    const body = await res.text()

    t.is(res.headers.get('content-type'), 'text/plain charset=utf-8')
    t.is(body, 'foo im a grizzly bear')
})

test('receive stream', async (t) => {
    const readable = new Readable()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    readable._read = () => { }
    readable.push('foo')
    readable.push(', bar')
    readable.push(null)

    const fn = async (c: Context) => {
        const body = await receive.text(c)
        t.true(typeof body === 'string')
        send.text(c, body)
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: readable
    })

    const body = await res.text()

    t.is(res.headers.get('content-type'), 'text/plain charset=utf-8')
    t.is(body, 'foo, bar')
})

test('json should throw 400 on empty body', async (t) => {
    type ErrorPayload = {
        message: string
    }

    const fn = async (c: Context) => {
        const body = await receive.json(c)
        send.json(c, body)
    }

    const url = await server(fn)
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(body.message, 'Invalid JSON')
    t.is(res.status, 400)
})

test('json cache works', async (t) => {
    const fn = async (c: Context) => {
        const bodyOne = await receive.json(c)
        const bodyTwo = await receive.json(c)
        t.true(bodyOne === bodyTwo)
        c.res.end()
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: JSON.stringify({
            foo: 'foo'
        })
    })

    t.is(res.status, 200)
})

