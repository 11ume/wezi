import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import { text, json, buffer } from 'wezi-receive'
import { server } from './helpers'

type ErrorPayload = {
    message: string
};

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

    const fn = async (c: Context) => json<Character[]>(c)
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
        const body = await json(c)
        return {
            body
        }
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
        const body = await buffer(c)
        t.true(Buffer.isBuffer(body))
        return body
    }
    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: Buffer.from('🐻')
    })

    const body = await res.text()
    t.is(body, '🐻')
})

test('receive text', async (t) => {
    const fn = async (c: Context) => text(c)
    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: '🐻 im a grizzly bear'
    })

    const body = await res.text()
    t.is(body, '🐻 im a grizzly bear')
})

test('json should throw 400 on empty body with no headers', async (t) => {
    const fn = async (c: Context) => json(c)
    const url = await server(fn)

    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(body.message, 'Invalid JSON')
    t.is(res.status, 400)
})

test('json cache works', async (t) => {
    const fn = async (c: Context) => {
        const bodyOne = await json(c)
        const bodyTwo = await json(c)
        t.deepEqual(bodyOne, bodyTwo)
        c.res.end()
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: JSON.stringify({
            foo: 'fooy'
        })
    })

    t.is(res.status, 200)
})

