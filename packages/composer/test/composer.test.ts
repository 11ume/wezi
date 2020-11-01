import test from 'ava'
import composer from '..'
import http, { IncomingMessage, ServerResponse } from 'http'
import listen from 'test-listen'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import createError from 'wezi-error'

const server = (fn: (req: IncomingMessage, res: ServerResponse) => void) => {
    return listen(http.createServer((req, res) => fn(req, res)))
}

test('main composer handler flow', async (t) => {
    const url = await server((req, res) => {
        const handler = () => 'hello'
        const dispatch = composer(true, handler)
        const context = {
            req
            , res
            , next: null
            , error: null
            , errorHandler: null
        }

        dispatch(context)
    })

    const res = await fetch(`${url}/`)
    const r = await res.text()
    t.is(r, 'hello')
})

test('main composer multi handlers', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => {
            c.next()
        }
        const hello = () => 'hello'
        const dispatch = composer(true, check, hello)
        const context = {
            req
            , res
            , next: null
            , error: null
            , errorHandler: null
        }

        dispatch(context)
    })

    const res = await fetch(`${url}/`)
    const r = await res.text()
    t.is(r, 'hello')
})

test('main composer multi handlers async', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => {
            c.next()
        }
        const hello = () => Promise.resolve('hello')
        const dispatch = composer(true, check, hello)
        const context = {
            req
            , res
            , next: null
            , error: null
            , errorHandler: null
        }

        dispatch(context)
    })

    const res = await fetch(`${url}/`)
    const r = await res.text()
    t.is(r, 'hello')
})

test('main composer multi handlers next error', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => {
            c.next(createError(400))
        }
        const hello = () => Promise.resolve('hello')
        const errorHandler = (context: Context) => {
            context.res.statusCode = context.error.statusCode || 500
            context.res.end()
        }
        const dispatch = composer(true, check, hello)
        const context = {
            req
            , res
            , next: null
            , error: null
            , errorHandler
        }

        dispatch(context)
    })

    const res = await fetch(`${url}/`)
    t.is(res.status, 400)
})


test('main composer multi handlers throw error', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => c.next()
        const hello = () => Promise.reject(new Error('yay'))
        const errorHandler = (context: Context) => {
            context.res.statusCode = 500
            context.res.end(JSON.stringify({
                message: context.error.message
            }))
        }
        const dispatch = composer(true, check, hello)
        const context = {
            req
            , res
            , next: null
            , error: null
            , errorHandler
        }

        dispatch(context)
    })

    const res = await fetch(`${url}/`)
    const r = await res.json()
    t.is(r.message, 'yay')
    t.is(res.status, 500)
})