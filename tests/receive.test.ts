import test from 'ava'
import fetch from 'node-fetch'
import { Context } from '../packages/types'
import { text, json, buffer } from '../packages/receive'
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

test('receive buffer whit charset header encoding', async (t) => {
    const fn = async (c: Context) => {
        const body = await buffer(c)
        t.true(Buffer.isBuffer(body))
        return body
    }
    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: Buffer.from('🐻 im a grizzly bear')
        , headers: {
            'contet-type': 'application/octet-stream; charset=utf-8'
        }
    })

    const body = await res.text()
    t.is(body, '🐻 im a grizzly bear')
})

test('receive buffer whit encoding option', async (t) => {
    const fn = async (c: Context) => {
        const body = await buffer(c, {
            encoding: 'utf-8'
        })
        t.true(Buffer.isBuffer(body))
        return body
    }
    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: '🐻 im a grizzly bear'
    })

    const body = await res.text()
    t.is(body, '🐻 im a grizzly bear')
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

test('json from rawBodyMap works', async (t) => {
    type Body = {
        message: string
    }

    const fn = async (c: Context) => {
        const bodyOne = await json<Body>(c) // esta mal
        const bodyTwo = await json<Body>(c)

        t.deepEqual(bodyOne, bodyTwo)

        return {
            message: bodyOne.message
        }
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: JSON.stringify({
            message: 'foo'
        })
    })

    const body: { message: string } = await res.json()
    t.is(body.message, 'foo')
})

test('json should throw 400 on empty body with no headers', async (t) => {
    const fn = async (c: Context) => json(c)
    const url = await server(fn)

    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(body.message, 'Invalid JSON')
    t.is(res.status, 400)
})

test('text should throw 400 on invalid encoding', async (t) => {
    const fn = async (c: Context) => json(c, {
        encoding: 'lol'
    })

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: 'foo'
    })

    const body: ErrorPayload = await res.json()

    t.is(body.message, 'Invalid body')
    t.is(res.status, 400)
})

test('buffer should throw 400 on invalid encoding', async (t) => {
    const fn = async (c: Context) => buffer(c, {
        encoding: 'lol'
    })
    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: 'foo'
    })

    const body: ErrorPayload = await res.json()

    t.is(body.message, 'Invalid body')
    t.is(res.status, 400)
})

test('json limit (below)', async (t) => {
    const fn = async (c: Context) => {
        const body = await json(c, {
            limit: 100
        })

        return body
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: JSON.stringify({
            message: 'foo'
        })
    })

    const body: ErrorPayload = await res.json()

    t.is(res.status, 200)
    t.is(body.message, 'foo')
})

test('json limit (over)', async (t) => {
    const fn = async (c: Context) => {
        try {
            return await json(c, {
                limit: 3
            })
        } catch (err) {
            t.deepEqual(err.statusCode, 413)
            return 'ok'
        }
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: JSON.stringify({
            message: 'foo'
        })
    })

    t.is(res.status, 200)
})

test('json limit (over) unhandled', async (t) => {
    const fn = (c: Context) => {
        return json(c, {
            limit: 2
        })
    }

    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: JSON.stringify({
            message: 'foo'
        })
    })

    const body: ErrorPayload = await res.json()

    t.is(res.status, 413)
    t.is(body.message, 'Body exceeded 2 limit')
})
