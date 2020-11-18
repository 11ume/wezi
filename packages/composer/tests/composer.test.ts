import test from 'ava'
import http, { IncomingMessage, ServerResponse } from 'http'
import listen from 'test-listen'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import createError, { HttpError } from 'wezi-error'
import composer from '..'

const server = (fn: (req: IncomingMessage, res: ServerResponse) => void) => {
    return listen(http.createServer((req, res) => fn(req, res)))
}

const createContext = ({
    req
    , res
    , next = null
    , shared = {}
    , errorHandler = null
}): Context => ({
    req
    , res
    , next
    , shared
    , errorHandler
})

test('main composer single handler, direct<string:200>', async (t) => {
    const url = await server((req, res) => {
        const greet = () => 'hello'
        const dispatch = composer(true, greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'hello')
})

test('main composer single handler, direct<empty:204>', async (t) => {
    const url = await server((req, res) => {
        const empty = () => null
        const dispatch = composer(true, empty)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 204)
    t.is(body, '')
})

test('main composer multi handler, direct return in first handler, direct<empty:204>', async (t) => {
    const url = await server((req, res) => {
        const empty = () => null
        const greet = () => 'hello'
        const dispatch = composer(true, empty, greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 204)
    t.is(body, '')
})

test('main composer multi handler, direct return in second handler, next<empty> direct<empty:204>', async (t) => {
    const url = await server((req, res) => {
        const empty = (c: Context) => c.next()
        const greet = () => null
        const dispatch = composer(true, empty, greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 204)
    t.is(body, '')
})

test('main composer multi handler, direct return in first handler, direct<string:200>', async (t) => {
    const url = await server((req, res) => {
        const greet = () => 'hello'
        const never = () => 'never'
        const dispatch = composer(true, greet, never)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'hello')
})

test('main composer multi handler, direct return in second handler, next<empty> direct<string:200>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next()
        const greet = () => 'hello'
        const dispatch = composer(true, next, greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'hello')
})

test('main composer multi handler async, direct promise return in first handler, direct<Promise<string>:200>', async (t) => {
    const url = await server((req, res) => {
        const greet = () => Promise.resolve('hello')
        const never = () => 'never'
        const dispatch = composer(true, greet, never)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const r = await res.text()

    t.is(res.status, 200)
    t.is(r, 'hello')
})

test('main composer multi handler async, direct promise return in second handler, next<empty>, direct<Promise<string>:200>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next()
        const greet = () => Promise.resolve('hello')
        const dispatch = composer(true, next, greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const r = await res.text()

    t.is(res.status, 200)
    t.is(r, 'hello')
})

test('main composer multi handler async, direct promise error return in first handler, next<Error:400>', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => c.next(createError(400))
        const never = () => Promise.resolve('hello')
        const errorHandler = (context: Context, error: Partial<HttpError>) => {
            context.res.statusCode = error.statusCode || 500
            context.res.end(error.message)
        }
        const dispatch = composer(true, check, never)
        const context = createContext({
            req
            , res
            , errorHandler
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: string = await res.text()

    t.is(res.status, 400)
    t.is(body, 'Bad Request')
})

test('main composer multi handler async, direct promise error return in second handler, next<empty>, direct<Promise<Error>:400>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next()
        const greet = () => Promise.reject(createError(400))
        const errorHandler = (context: Context, error: Partial<HttpError>) => {
            context.res.statusCode = error.statusCode || 500
            context.res.end(error.message)
        }

        const dispatch = composer(true, next, greet)
        const context = createContext({
            req
            , res
            , errorHandler
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: string = await res.text()

    t.is(res.status, 400)
    t.is(body, 'Bad Request')
})

test('main composer multi handler, throw error inside first handler, <Error>', async (t) => {
    const url = await server((req, res) => {
        const err = () => {
            throw new Error('Something wrong is happened')
        }
        const never = () => 'hello'
        const errorHandler = (context: Context, error: Partial<HttpError>) => {
            context.res.statusCode = 500
            context.res.end(error.message)
        }
        const dispatch = composer(true, err, never)
        const context = createContext({
            req
            , res
            , errorHandler
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: string = await res.text()

    t.is(body, 'Something wrong is happened')
    t.is(res.status, 500)
})

test('main composer multi handlers, pass parameters whit next, next<string>, direct<Promise<string:200>>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next('hello')
        const greet = (_, message: string) => message
        const dispatch = composer(true, next, greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const r = await res.text()

    t.is(res.status, 200)
    t.is(r, 'hello')
})

test('main composer multi handlers async, pass parameters whit next, next<string>, direct<Promise<string:200>>', async (t) => {
    const delay = (time: number, msg: string) => new Promise((r) => setTimeout(r, time, msg))
    const url = await server((req, res) => {
        const next = async (c: Context) => {
            const msg = await delay(2000, 'hello')
            c.next(msg)
        }
        const greet = (_, message: string) => {
            t.is(message, 'hello')
            return message
        }
        const dispatch = composer(true, next, greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const r = await res.text()

    t.is(res.status, 200)
    t.is(r, 'hello')
})

test('main composer end the response if higher-order handlers are executed and none of them have call end, next<empty> next<empty>', async (t) => {
    const url = await server((req, res) => {
        const dispatch = composer(true, (c: Context) => c.next(), (c: Context) => c.next())
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    t.is(res.status, 404)
})
