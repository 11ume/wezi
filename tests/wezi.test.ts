import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import wezi, { listen } from 'wezi'
import { server } from './helpers'

test('server listen, direct', async (t) => {
    const w = wezi(() => 'hello')
    await listen(w, 3000)
    const res = await fetch('http://localhost:3000')
    const r = await res.text()

    t.is(r, 'hello')
})

test('context redirect response', async (t) => {
    const w = wezi(({ req, res, actions }: Context) => {
        if (req.url === '/redirect') {
            res.end()
            return
        }
        actions.redirect('/redirect')
    })

    await listen(w, 3002)
    const res = await fetch('http://localhost:3002')
    t.true(res.redirected)
})

test('context body parse json', async (t) => {
    type Character = {
        name: string
    }

    const fn = async ({ body }: Context): Promise<Character> => body.json()
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

test('context body parse buffer', async (t) => {
    const fn = async ({ body }: Context) => body.buffer()
    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: Buffer.from('🐻')
    })

    const body = await res.text()
    t.is(body, '🐻')
})

test('context body parse text', async (t) => {
    const fn = async ({ body }: Context) => body.text()
    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST'
        , body: '🐻 im a small polar bear'
    })

    const body = await res.text()
    t.is(body, '🐻 im a small polar bear')
})

