import test from 'ava'
import fetch from 'node-fetch'
import wezi, { listen } from 'wezi'
import createError, { InternalError } from 'wezi-error'
import { Context, Handler } from 'wezi-types'
import { text, json, buffer } from 'wezi-receive'
import { createComposer, ErrorHandler } from 'wezi-composer'
import { server, serverError, giveMeOneAdress } from './helpers'

const getAddress = giveMeOneAdress(3000)

test('server listen lazy', async (t) => {
    const w = wezi(() => 'hello')
    const { port, url } = getAddress()
    listen(w(), {
        port
    })
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, 'hello')
})

test('server listen no lazy reply, must not emit write after end error', async (t) => {
    const w = wezi((c: Context) => {
        c.res.end('hello')
        return 'never'
    })
    const { port, url } = getAddress()
    listen(w(), {
        port
        , lazy: false
    })
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'hello')
})

test('server listen no lazy reply, throw error', async (t) => {
    const w = wezi(() => {
        throw createError(500, 'Internal Error')
    })
    const { port, url } = getAddress()
    listen(w(), {
        port
        , lazy: false
    })
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'Internal Error')
})

test('server listen no lazy reply, throw error inside of promise', async (t) => {
    const w = wezi(async () => {
        throw createError(400, 'Bad Request')
    })
    const { port, url } = getAddress()
    listen(w(), {
        port
        , lazy: false
    })
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 400)
    t.is(body.message, 'Bad Request')
})

test('create custom error handler and throw error inside handler whit listen fn', async (t) => {
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
        const ln = listen(w(errorHandler), {
            port
        })

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

    const handler = (c: Context): Promise<Character> => json(c)

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
    const handler = (c: Context) => buffer(c)

    const url = await server(handler)
    const res = await fetch(url, {
        method: 'POST'
        , body: Buffer.from('🐻')
    })

    const body = await res.text()

    t.is(body, '🐻')
})

test('parse and reply same received text', async (t) => {
    const handler = (c: Context) => text(c)

    const url = await server(handler)
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

    const url = await server(handler)
    const res = await fetch(url)

    t.is(res.status, 420)
})

test('response only whit status code and custom status message', async (t) => {
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

test('response only whit status code and whitout custom status message', async (t) => {
    const handler = ({ res }: Context) => {
        res.statusCode = 300
        res.end()
    }

    const url = await server(handler)
    const res = await fetch(url)

    t.is(res.status, 300)
    t.is(res.statusText, 'Multiple Choices')
})

test('create custom composer', async (t) => {
    const { port, url } = getAddress()
    const w = wezi(() => 'hello')
    const execute = (c: Context, handler: Handler) => {
        const val = handler(c)
        c.res.end(val)
    }
    const composer = createComposer(null, null, execute)
    listen(w(), {
        port
        , composer
    })
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, 'hello')
})

test('create custom composer whit error proxy handler', async (t) => {
    const { port, url } = getAddress()
    const errorHandler = (c: Context, error: Partial<InternalError>) => {
        const message = error.message
        c.res.statusCode = error.code
        c.res.end(message)
    }

    const errorHandlerProxy = (c: Context, error: Error, customErrorHandler: ErrorHandler) => {
        customErrorHandler(c, error)
    }

    const fail = () => {
        throw createError(500, 'Internal Error')
    }

    const w = wezi(fail)
    const execute = (c: Context, handler: Handler) => {
        try { handler(c) } catch (err) {
            c.panic(err)
        }
    }

    const composer = createComposer(errorHandlerProxy, null, execute)
    listen(w(errorHandler), {
        port
        , composer
    })
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 500)
    t.is(body, 'Internal Error')
})
