import test from 'ava'
import fetch from 'node-fetch'
import wezi, { listen } from 'wezi'
import { Context } from 'wezi-types'
import { text, json, buffer } from 'wezi-receive'
import { server } from './helpers'
import createError from 'wezi-error'

test('server listen lazy', async (t) => {
    const w = wezi(() => 'hello')

    listen(w, 3000)
    const res = await fetch('http://localhost:3000')
    const body = await res.text()

    t.is(body, 'hello')
})

test('server listen no lazy', async (t) => {
    const w = wezi((c: Context) => {
        c.res.end('hello')
        return 'never'
    })

    listen(w, 3001, {
        lazy: false
    })
    const res = await fetch('http://localhost:3001')
    const body = await res.text()

    t.is(body, 'hello')
})

test('response before lazy composer reply', async (t) => {
    const handler = ({ res }: Context) => {
        res.end('foo')
        return 'never'
    }

    const url = await server(false, handler)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo')
})

test('throw error inside handler', async (t) => {
    const handler = () => {
        throw createError(500, 'something wrong has happened')
    }

    const url = await server(false, handler)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'something wrong has happened')
})

test('throw promise error inside handler', async (t) => {
    const handler = async () => {
        throw createError(500, 'something wrong has happened')
    }

    const url = await server(false, handler)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'something wrong has happened')
})

test('parse and reply same received json', async (t) => {
    type Character = {
        name: string
    }

    const handler = (c: Context): Promise<Character> => json(c)

    const url = await server(true, handler)
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

test('parse and reply same received buffer', async (t) => {
    const handler = (c: Context) => buffer(c)

    const url = await server(true, handler)
    const res = await fetch(url, {
        method: 'POST'
        , body: Buffer.from('🐻')
    })

    const body = await res.text()

    t.is(body, '🐻')
})

test('parse and reply same received text', async (t) => {
    const handler = (c: Context) => text(c)

    const url = await server(true, handler)
    const res = await fetch(url, {
        method: 'POST'
        , body: '🐻 im a small polar bear'
    })

    const body = await res.text()

    t.is(body, '🐻 im a small polar bear')
})

test('response only whit status code', async (t) => {
    const handler = ({ res }: Context) => {
        res.statusCode = 420
        res.end()
    }

    const url = await server(true, handler)
    const res = await fetch(url)

    t.is(res.status, 420)
})

test('response only whit status code and custom status message', async (t) => {
    const handler = ({ res }: Context) => {
        res.statusCode = 420
        res.statusMessage = 'Enhance your calm'
        res.end()
    }

    const url = await server(true, handler)
    const res = await fetch(url)

    t.is(res.status, 420)
    t.is(res.statusText, 'Enhance your calm')
})

test('response only whit status code and whitout custom status message', async (t) => {
    const handler = ({ res }: Context) => {
        res.statusCode = 300
        res.end()
    }

    const url = await server(true, handler)
    const res = await fetch(url)

    t.is(res.status, 300)
    t.is(res.statusText, 'Multiple Choices')
})

