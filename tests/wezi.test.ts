import test from 'ava'
import fetch from 'node-fetch'
import createError, { HttpError } from '../packages/error'
import { Context } from '../packages/types'
import { server } from './helpers'
import wezi, { listen } from 'wezi'

test('server listen', async (t) => {
    const w = wezi(() => 'hello')
    await listen(w(), 3000)
    const res = await fetch('http://localhost:3000')
    const r = await res.text()

    t.is(r, 'hello')
})

test('main composer handler flow', async (t) => {
    const hello = () => 'hello'
    const url = await server(hello)
    const res = await fetch(url)
    const r = await res.text()

    t.is(r, 'hello')
})

test('main composer multi handlers', async (t) => {
    const check = (c: Context) => c.next()
    const hello = () => 'hello'
    const url = await server(check, hello)
    const res = await fetch(url)
    const r = await res.text()

    t.is(r, 'hello')
})

test('main composer multi handlers async', async (t) => {
    const check = (c: Context) => c.next()
    const hello = () => Promise.resolve('hello')
    const url = await server(check, hello)
    const res = await fetch(url)
    const r = await res.text()

    t.is(r, 'hello')
})

test('main composer multi handlers pass parameters whit next', async (t) => {
    const check = (c: Context) => c.next('hello')
    const hello = (_, message: string) => Promise.resolve(message)
    const url = await server(check, hello)
    const res = await fetch(url)
    const r = await res.text()

    t.is(r, 'hello')
})

test('main composer multi handlers pass async parameters whit next', async (t) => {
    const delay = (time: number, msg: string): Promise<string> => new Promise((r) => setTimeout(r, time, msg))
    const check = async (c: Context) => {
        const body = await delay(500, 'hello')
        c.next(body)
    }
    const hello = (_, message: string) => {
        t.is(message, 'hello')
        return message
    }
    const url = await server(check, hello)
    const res = await fetch(url)
    const r = await res.text()

    t.is(r, 'hello')
})

test('main composer multi handlers error', async (t) => {
    const check = () => {
        throw createError(400)
    }
    const hello = () => Promise.resolve('hello')
    const errorHandler = (context: Context, error: Partial<HttpError>) => {
        context.res.statusCode = error.statusCode || 500
        context.res.end()
    }
    const url = await server(check, hello, errorHandler)
    const res = await fetch(url)

    t.is(res.status, 400)
})

test('main composer multi handlers throw error', async (t) => {
    const check = (c: Context) => c.next()
    const hello = () => Promise.reject(new Error('Something wrong is happened'))
    const errorHandler = (context: Context, error: Partial<HttpError>) => {
        context.res.statusCode = 500
        context.res.end(JSON.stringify({
            message: error.message
        }))
    }
    const url = await server(check, hello, errorHandler)
    const res = await fetch(url)
    const r = await res.json()

    t.is(r.message, 'Something wrong is happened')
    t.is(res.status, 500)
})
