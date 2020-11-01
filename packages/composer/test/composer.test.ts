import test from 'ava'
import composer from '..'
import http, { IncomingMessage, ServerResponse } from 'http'
import listen from 'test-listen'
import fetch from 'node-fetch'
import { Context, NextFunction } from 'wezi-types'
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
        const check = (_, next: NextFunction) => {
            next()
        }
        const hello = () => 'hello'
        const dispatch = composer(true, check, hello)
        const context = {
            req
            , res
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
        const check = (_, next: NextFunction) => {
            next()
        }
        const hello = () => Promise.resolve('hello')
        const dispatch = composer(true, check, hello)
        const context = {
            req
            , res
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
        const check = (_, next: NextFunction) => {
            next(createError(400))
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
        const check = (_, next: NextFunction) => next()
        const hello = () => Promise.reject(new Error('youp'))
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
            , error: null
            , errorHandler
        }

        dispatch(context)
    })

    const res = await fetch(`${url}/`)
    const r = await res.json()
    t.is(r.message, 'youp')
    t.is(res.status, 500)
})