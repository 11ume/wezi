import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import wezi, { listen } from 'wezi'
import { server } from './helpers'

test('server listen', async (t) => {
    const w = wezi(() => 'hello')

    listen(w, 3000)
    const res = await fetch('http://localhost:3000')
    const body = await res.text()

    t.is(body, 'hello')
})

test('context redirect response', async (t) => {
    const handler = ({ req, res, actions }: Context) => {
        if (req.url === '/redirect') {
            res.end()
            return
        }
        actions.redirect('/redirect')
    }

    const url = await server(handler)
    const res = await fetch(url)

    t.true(res.redirected)
})

test('context body parse json', async (t) => {
    type Character = {
        name: string
    }

    const handler = ({ body }: Context): Promise<Character> => body.json()

    const url = await server(handler)
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
    const handler = ({ body }: Context) => body.buffer()

    const url = await server(handler)
    const res = await fetch(url, {
        method: 'POST'
        , body: Buffer.from('🐻')
    })

    const body = await res.text()

    t.is(body, '🐻')
})

test('context body parse text', async (t) => {
    const handler = ({ body }: Context) => body.text()

    const url = await server(handler)
    const res = await fetch(url, {
        method: 'POST'
        , body: '🐻 im a small polar bear'
    })

    const body = await res.text()

    t.is(body, '🐻 im a small polar bear')
})

test('context set response status code', async (t) => {
    const handler = ({ res }: Context) => {
        res.statusCode = 420
        res.end()
    }

    const url = await server(handler)
    const res = await fetch(url)

    t.is(res.status, 420)
})

test('context set response status code whit message', async (t) => {
    const handler = ({ res }: Context) => {
        res.statusCode = 420
        res.statusMessage = 'Enhance your calm'
        res.end()
    }

    const url = await server(handler)
    const res = await fetch(url)

    t.is(res.status, 420)
    t.is(res.statusText, 'Enhance your calm')
})

test('context set response status code whitout message', async (t) => {
    const handler = ({ res }: Context) => {
        res.statusCode = 300
        res.end()
    }

    const url = await server(handler)
    const res = await fetch(url)

    t.is(res.status, 300)
    t.is(res.statusText, 'Multiple Choices')
})
