import test from 'ava'
import fetch from 'node-fetch'
import * as send from 'wezi-send'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import { server, createContext } from './helpers'
import { composer, composerMain } from '..'

test('main composer end response if all higher are executed, and none of them has ended the response :400>', async (t) => {
    const foo = (c: Context) => c.next()
    const bar = (c: Context) => c.next()
    const url = await server((req, res) => {
        const context = createContext({
            req
            , res
        })

        const run = composerMain(undefined, foo, bar)
        run(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 404)
    t.deepEqual(body, {
        message: 'Not Found'
    })
})

test('main composer multi handler async, direct promise error return in first handler, panic(Error(400)) :400', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => c.panic(createError(400))
        const never = (c: Context) => send.text(c, 'hello')
        const run = composer()(check, never)
        const context = createContext({
            req
            , res
        })

        run(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 400)
    t.deepEqual(body, {
        message: 'unknown'
    })
})

test('main composer multi handler async, direct promise error return in second handler, next(), errorHandler(Error(400)) :400>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next()
        const greet = () => Promise.reject(createError(400))
        const run = composer()(next, greet)
        const context = createContext({
            req
            , res
        })

        run(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 400)
    t.deepEqual(body, {
        message: 'unknown'
    })
})

test('main composer multi handler, throw error inside first handler, errorHandler(Error(500)) :500', async (t) => {
    const url = await server((req, res) => {
        const err = () => {
            throw new Error('Something wrong has happened')
        }
        const never = () => 'hello'
        const run = composer()(err, never)
        const context = createContext({
            req
            , res
        })

        run(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.deepEqual(body, {
        message: 'Something wrong has happened'
    })
})

test('main composer call panic whiout pass an error, panic({ foo:"foo" })', async (t) => {
    const url = await server((req, res) => {
        const run = composer()((c: Context) => c.panic({
            foo: 'foo'
        } as any))
        const context = createContext({
            req
            , res
        })

        run(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.deepEqual(body, {
        message: 'panic error param, must be instance of Error'
    })
})

test('main composer end the response if higher-order handlers are executed and none of them have call end, next() next()', async (t) => {
    const url = await server((req, res) => {
        const run = composerMain(undefined, (c: Context) => c.next(), (c: Context) => c.next())
        const context = createContext({
            req
            , res
        })

        run(context)
    })

    const res = await fetch(url)
    t.is(res.status, 404)
})
