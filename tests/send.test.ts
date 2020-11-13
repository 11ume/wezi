import test from 'ava'
import fetch from 'node-fetch'
import { send } from '../packages/send'
import { Context } from '../packages/types'
import { server } from './helpers'

test('send text string message', async (t) => {
    const fn = (c: Context) => send(c, 200, 'hello')
    const url = await server(fn)
    const res = await fetch(url)

    const body = await res.text()
    t.is(body, 'hello')
    t.is(res.headers.get('Content-Length'), '5')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('send text number message', async (t) => {
    const fn = (c: Context) => send(c, 200, 1)
    const url = await server(fn)
    const res = await fetch(url)

    const body = await res.text()
    t.is(body, '1')
    t.is(res.headers.get('Content-Length'), '1')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('send json message', async (t) => {
    const fn = (c: Context) => send(c, 200, {
        message: 'hello'
    })
    const url = await server(fn)
    const res = await fetch(url)

    const body: { message: string } = await res.json()
    t.is(res.status, 200)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('send empty', async (t) => {
    const fn = (c: Context) => send(c)
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 204)
})

test('send payload whit status code', async (t) => {
    const fn = (c: Context) => send(c, 401, {
        message: 'hello'
    })
    const url = await server(fn)
    const res = await fetch(url)

    const body: { message: string } = await res.json()
    t.is(res.status, 401)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('send only status code', async (t) => {
    const fn = (c: Context) => send(c, 400)
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 400)
})

test('send Not Content whit other status', async (t) => {
    const fn = (c: Context) => send(c, 400, null)
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 400)
})

test('send direct message', async (t) => {
    const fn = () => 'hello'
    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'hello')
})

test('send direct json', async (t) => {
    const fn = () => ({
        message: 'hello'
    })
    const url = await server(fn)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 200)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
    t.is(res.headers.get('Content-Length'), '19')
})

test('send direct Not Content 204', async (t) => {
    const fn = () => null
    const url = await server(fn)
    const res = await fetch(url)

    t.is(res.status, 204)
})

