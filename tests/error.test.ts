import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import { server } from './helpers'

type ErrorPayload = {
    message: string
};

test.before('pass to panic http error in production', async (t) => {
    process.env.NODE_ENV = 'production'
    const url = await server(true, (c: Context) => c.panic(createError(420)))
    const res = await fetch(url)
    const body: string = await res.text()

    process.env.NODE_ENV = ''
    t.is(res.status, 420)
    t.is(body, '')
})

test('pass to panic empty error', async (t) => {
    const url = await server(true, (c: Context) => c.panic(new Error()))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'unknown')
})

test('pass to panic random error whit message', async (t) => {
    const url = await server(true, (c: Context) => c.panic(new Error('error message')))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'error message')
})

test('create custom error and call panic fn only whit code', async (t) => {
    const url = await server(true, (c: Context) => c.panic(createError(420)))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 420)
    t.is(body.message, 'unknown')
})

test('create custom error and call panic whit code and message', async (t) => {
    const url = await server(true, (c: Context) => c.panic(createError(418, 'im a teapot')))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 418)
    t.is(body.message, 'im a teapot')
})

test('create custom error and pass this error to panic fn, whit multiple handlers combine next and panic', async (t) => {
    const url = await server(true, (c: Context) => c.next(), (c: Context) => c.panic(createError(420)), () => 'never')
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 420)
    t.is(body.message, 'unknown')
})
