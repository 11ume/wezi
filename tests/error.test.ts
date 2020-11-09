import test from 'ava'
import fetch from 'node-fetch'
import { Context } from '../packages/types'
import createError from '../packages/error'
import { server } from './helpers'

type ErrorPayload = {
    message: string
};

test('create and return http error', async (t) => {
    const url = await server((c: Context) => c.next(createError(420)))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 420)
    t.is(body.message, 'Enhance Your Calm')
})

test('create and return http error whit custom status code and message', async (t) => {
    const url = await server((c: Context) => c.next(createError(418, 'Im a teapot')))
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 418)
    t.is(body.message, 'Im a teapot')
})

test('create and return http error multiple handlers', async (t) => {
    const url = await server((c: Context) => c.next(), (c: Context) => c.next(createError(420)), () => 'not')
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 420)
    t.is(body.message, 'Enhance Your Calm')
})
