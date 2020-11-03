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
    const fn = async (c: Context) => buffer(c, { encoding: 'lol' })
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

    const res = await fetch(url, { method: 'POST', body: '🐻' })
    const body = await res.text()
    t.is(body, '🐻')
})

test('Content-Type header for JSON is set', async t => {
    const url = await server(() => ({}))
    const res = await fetch(url)

    t.is(res.headers.get('content-type'), 'application/json charset=utf-8')
})

test('json limit (below)', async (t) => {
    type Payload = {
        message: string
    }
    const fn = async (c: Context) => {
        const body = await json<Payload>(c, {
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

    const body: Payload = await res.json()
    t.deepEqual(body.message, 'foo')
})

test('json limit (over)', async t => {
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
        method: 'POST',
        body: JSON.stringify({
            message: 'foo'
        })
    })

    t.deepEqual(res.status, 200)
})

test('json limit (over) unhandled', async t => {
    const fn = (c: Context) => {
        return json(c, {
            limit: 3
        })
    }

    const url = await server(fn)
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                message: 'fooas'
            })
        })

        const body: { message:  } = await res.text()
        t.is(res.status, 413)
        t.is(body.message, 'Body exceeded 2 limit')

    } catch (err) {
        t.is(err.message, 'Body exceeded as${limit} limit')
    }
})

// test('json circular', async t => {
// 	const fn = async (req, res) => {
// 		const obj = {
// 			circular: true
// 		}

// 		obj.obj = obj
// 		send(res, 200, obj)
// 	}

// 	const url = await getUrl(fn)

// 	const {status} = await fetch(url)
// 	t.deepEqual(status, 500)
// })