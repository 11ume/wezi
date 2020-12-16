import test from 'ava'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import { Context } from 'wezi-types'
import { InternalError, createError } from 'wezi-error'
import wezi, { listen } from 'wezi'
import { server } from './helpers'

test('server listen, direct<string:200>', async (t) => {
    const w = wezi(() => 'hello')
    await listen(w, 3000)
    const res = await fetch('http://localhost:3000')
    const r = await res.text()

    t.is(r, 'hello')
})

test('create custom error handler', async (t) => {
    const w = wezi((c: Context) => c.panic(createError(400)), () => 'hello')
    const errorHandler = (context: Context, error: Partial<InternalError>) => {
        context.res.statusCode = error.statusCode ?? 500
        context.res.end(error.message)
    }
    await listen((req, res) => w(req, res, errorHandler), 3001)
    const res = await fetch('http://localhost:3001')
    const r = await res.text()

    t.is(res.status, 400)
    t.is(r, 'Bad Request')
})

test('context redirect response', async (t) => {
    const w = wezi((c: Context) => {
        if (c.req.url === '/redirect') {
            c.res.end()
            return
        }
        c.actions.redirect('/redirect')
    })

    await listen(w, 3002)
    const res = await fetch('http://localhost:3002')
    t.true(res.redirected)
})

test('context receive json', async (t) => {
    type Character = {
        name: string
    }

    const fn = async ({ receive }: Context): Promise<Character> => receive.json()
    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: JSON.stringify({
            name: 't800'
        })
    })

    const body: Character = await res.json()
    t.is(res.headers.get('content-type'), 'application/json charset=utf-8')
    t.is(body.name, 't800')
})

test('context receive buffer', async (t) => {
    const fn = async ({ receive }: Context) => receive.buffer()
    const url = await server(fn)

    const res = await fetch(url, {
        method: 'POST'
        , body: '🐻'
    })

    const body = await res.text()
    t.is(body, '🐻')
})

test('context receive text', async (t) => {
    const fn = async ({ receive }: Context) => receive.text()
    const url = await server(fn)

    const res = await fetch(url, {
        method: 'POST'
        , body: '🐻 im a small polar bear'
    })

    const body = await res.text()
    t.is(body, '🐻 im a small polar bear')
})

test('context send text string message', async (t) => {
    const fn = ({ send }: Context) => send.text(200, 'hello')
    const url = await server(fn)
    const res = await fetch(url)

    const body = await res.text()
    t.is(body, 'hello')
    t.is(res.headers.get('Content-Length'), '5')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('context send json message', async (t) => {
    const fn = ({ send }: Context) => send.json(200, {
        message: 'hello'
    })
    const url = await server(fn)
    const res = await fetch(url)

    const body: { message: string } = await res.json()
    t.is(res.status, 200)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('context send ok', async (t) => {
    const fn = ({ send }: Context) => send.ok()
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 200)
})

test('context send empty', async (t) => {
    const fn = ({ send }: Context) => send.empty()
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 204)
})

test('context send buffer', async (t) => {
    const fn = ({ send }: Context) => send.buffer(200, Buffer.from('foo'))
    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo')
})

test('send stream readable', async (t) => {
    const readable = new Readable()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    readable._read = () => { }
    readable.push('foo')
    readable.push(null)

    const fn = ({ send }: Context) => send.stream(200, readable)
    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo')
})

