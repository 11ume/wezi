import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import { server, createContext } from './helpers'
import { lazyComposer as composer } from '..'

test('main composer end response if all higher are executed, and none of them has ended the response, errorHandler<Error:400>', async (t) => {
    const foo = (c: Context) => c.next()
    const bar = (c: Context) => c.next()
    const url = await server((req, res) => {
        const context = createContext({
            req
            , res
        })

        const prepare = composer()
        const dispatch = prepare(true, foo, bar)
        dispatch(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 404)
    t.deepEqual(body, {
        message: 'unknown'
    })
})

test('main composer multi handler async, direct promise error return in first handler, next<Error:400>', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => c.panic(createError(400))
        const never = () => Promise.resolve('hello')
        const prepare = composer()
        const dispatch = prepare(true, check, never)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 400)
    t.deepEqual(body, {
        message: 'unknown'
    })
})

test('main composer multi handler async, direct promise error return in second handler, next<empty>, direct<Promise<Error>:400>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next()
        const greet = () => Promise.reject(createError(400))
        const prepare = composer()
        const dispatch = prepare(true, next, greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 400)
    t.deepEqual(body, {
        message: 'unknown'
    })
})

test('main composer multi handler, throw error inside first handler, <Error>', async (t) => {
    const url = await server((req, res) => {
        const err = () => {
            throw new Error('Something wrong is happened')
        }
        const never = () => 'hello'
        const prepare = composer()
        const dispatch = prepare(true, err, never)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.deepEqual(body, {
        message: 'Something wrong is happened'
    })
})

test('main composer call panic whiout pass an error, panic<not error type>', async (t) => {
    const url = await server((req, res) => {
        const prepare = composer()
        const dispatch = prepare(true, (c: Context) => c.panic({
            foo: 'foo'
        } as any))
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 500)
    t.deepEqual(body, {
        message: 'panic error param, must be instance of Error'
    })
})

test('main composer end the response if higher-order handlers are executed and none of them have call end, next<empty> next<empty>', async (t) => {
    const url = await server((req, res) => {
        const prepare = composer()
        const dispatch = prepare(true, (c: Context) => c.next(), (c: Context) => c.next())
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    t.is(res.status, 404)
})
