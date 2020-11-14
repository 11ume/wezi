import test from 'ava'
import fetch from 'node-fetch'
import { Context } from '../packages/types'
import createError from '../packages/error'
import { server } from './helpers'

type ErrorPayload = {
    message: string
};

test.before('pass to next http error in production', async (t) => {
    process.env.NODE_ENV = 'production'
    const url = await server((c: Context) => c.next(createError(420)))
    const res = await fetch(url)
    const body: string = await res.text()

    process.env.NODE_ENV = ''
    t.is(res.status, 420)
    t.is(body, '')
})

test('pass to next empty error', async (t) => {
    const url = await server((c: Context) => c.next(new Error()))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'unknown')
})

test('pass to next random error whit message', async (t) => {
    const url = await server((c: Context) => c.next(new Error('opps')))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'opps')
})

test('create and pass to next http error', async (t) => {
    const url = await server((c: Context) => c.next(createError(420)))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 420)
    t.is(body.message, 'Enhance Your Calm')
})

test('create and pass to next http error whit custom status code and message', async (t) => {
    const url = await server((c: Context) => c.next(createError(418, 'Im a teapot')))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 418)
    t.is(body.message, 'Im a teapot')
})

test('create and pass to next http error multiple handlers', async (t) => {
    const url = await server((c: Context) => c.next(), (c: Context) => c.next(createError(420)), () => 'not')
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 420)
    t.is(body.message, 'Enhance Your Calm')
})
