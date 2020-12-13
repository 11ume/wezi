import test from 'ava'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import { Context } from 'wezi-types'
import wezi, { listen } from 'wezi'
import { server } from './helpers'

test('server listen, direct<string:200>', async (t) => {
    const w = wezi(() => 'hello')
    await listen(w(), 3000)
    const res = await fetch('http://localhost:3000')
    const r = await res.text()

    t.is(r, 'hello')
})

test('context redirect response', async (t) => {
    const w = wezi((c: Context) => {
        if (c.req.url === '/redirect') {
            c.res.end()
            return
        }
        c.redirect('/redirect')
    })
    await listen(w(), 3001)
    const res = await fetch('http://localhost:3001')
    t.true(res.redirected)
})

test('context send text string message', async (t) => {
    const fn = ({ send }: Context) => send.text('hello')
    const url = await server(fn)
    const res = await fetch(url)

    const body = await res.text()
    t.is(body, 'hello')
    t.is(res.headers.get('Content-Length'), '5')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('context send json message', async (t) => {
    const fn = ({ send }: Context) => send.json({
        message: 'hello'
    })
    const url = await server(fn)
    const res = await fetch(url)

    const body: { message: string } = await res.json()
    t.is(res.status, 200)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('context send empty', async (t) => {
    const fn = ({ send }: Context) => send.empty()
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 204)
})

test('context send buffer', async (t) => {
    const fn = ({ send }: Context) => send.buffer(Buffer.from('foo'))
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

    const fn = ({ send }: Context) => send.stream(readable)
    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo')
})

