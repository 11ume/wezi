import test from 'ava'
import fetch from 'node-fetch'
import wezi, { listen } from 'wezi'
import createError from 'wezi-error'
import { Context } from 'wezi-types'
import * as send from 'wezi-send'
import * as receive from 'wezi-receive'
import { server, serverError, giveMeOneAdress } from './helpers'

const getAddress = giveMeOneAdress(3000)

test('server listen', async (t) => {
    const w = wezi((c: Context) => send.text(c, 'hello'))
    const { port, url } = getAddress()
    listen(w(), port)
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, 'hello')
})

test('server listen throw error', async (t) => {
    const w = wezi(() => {
        throw createError(500, 'Internal Error')
    })
    const { port, url } = getAddress()
    listen(w(), port)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'Internal Error')
})

test('server listen throw error inside of promise', async (t) => {
    const w = wezi(async () => {
        throw createError(400, 'Bad Request')
    })
    const { port, url } = getAddress()
    listen(w(), port)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 400)
    t.is(body.message, 'Bad Request')
})

test('create custom error handler and throw error inside handler with listen fn', async (t) => {
    const { port, url } = getAddress()
    const errorHandler = (c: Context, error: Error) => {
        const message = error.message
        c.res.statusCode = 400
        c.res.end(message)
    }

    const fail = () => {
        throw createError(400, 'Bad Request')
    }

    const w = wezi(fail)

    const promListen = () => new Promise((r) => {
        const ln = listen(w(errorHandler), port)
        ln.on('listening', r)
    })

    await promListen()
    const res = await fetch(url)
    const message = await res.text()

    t.is(res.status, 400)
    t.is(message, 'Bad Request')
})

test('create custom error handler and throw error inside handler', async (t) => {
    const handler = () => {
        throw createError(500, 'something wrong has happened')
    }

    const errorHandler = (c: Context, error: Error) => {
        const message = error.message
        c.res.statusCode = 500
        c.res.end(message)
    }

    const url = await serverError(errorHandler, handler)
    const res = await fetch(url)
    const message = await res.text()

    t.is(res.status, 500)
    t.is(message, 'something wrong has happened')
})

test('throw error inside handler', async (t) => {
    const handler = () => {
        throw createError(500, 'something wrong has happened')
    }

    const url = await server(handler)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'something wrong has happened')
})

test('throw promise error inside handler', async (t) => {
    const handler = async () => {
        throw createError(500, 'something wrong has happened')
    }

    const url = await server(handler)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'something wrong has happened')
})

test('parse and reply same received json', async (t) => {
    type Character = {
        name: string
    }

    const handler = async (c: Context) => {
        const body: Character = await receive.json(c)
        send.json(c, body)
    }

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

test('parse and reply same received buffer', async (t) => {
    const handler = async (c: Context) => {
        const body = await receive.buffer(c)
        send.buffer(c, body)
    }

    const url = await server(handler)
    const res = await fetch(url, {
        method: 'POST'
        , body: Buffer.from('🐻')
    })

    const body = await res.text()

    t.is(body, '🐻')
})

test('parse and reply same received text', async (t) => {
    const handler = async (c: Context) => {
        const text = await receive.text(c)
        send.text(c, text)
    }

    const url = await server(handler)
    const res = await fetch(url, {
        method: 'POST'
        , body: '🐻 im a small polar bear'
    })

    const body = await res.text()

    t.is(body, '🐻 im a small polar bear')
})

test('response only with status code', async (t) => {
    const handler = ({ res }: Context) => {
        res.statusCode = 420
        res.end()
    }

    const url = await server(handler)
    const res = await fetch(url)

    t.is(res.status, 420)
})

test('response only with status code and custom status message', async (t) => {
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

test('response only with status code and without custom status message', async (t) => {
    const handler = ({ res }: Context) => {
        res.statusCode = 300
        res.end()
    }

    const url = await server(handler)
    const res = await fetch(url)

    t.is(res.status, 300)
    t.is(res.statusText, 'Multiple Choices')
})
