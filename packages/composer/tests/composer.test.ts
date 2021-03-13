import test from 'ava'
import fetch from 'node-fetch'
import * as send from 'wezi-send'
import { Context } from 'wezi-types'
import { server, createContext } from './helpers'
import { composer } from '..'

test('main composer single handler, send.text :200', async (t) => {
    const url = await server((req, res) => {
        const greet = (c: Context) => send.text(c, 'hello')
        const prepare = composer()
        const dispatch = prepare(true, greet)
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

test('main composer single handler, send.empty :204', async (t) => {
    const url = await server((req, res) => {
        const empty = (c: Context) => send.empty(c)
        const prepare = composer()
        const dispatch = prepare(true, empty)
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

test('main composer multi handler, direct return in first handler, send.empty :204', async (t) => {
    const url = await server((req, res) => {
        const empty = (c: Context) => send.empty(c)
        const greet = (c: Context) => send.text(c, 'hi')
        const prepare = composer()
        const dispatch = prepare(true, empty, greet)
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

test('main composer multi handler, direct return in second handler, next() send.empty :204', async (t) => {
    const url = await server((req, res) => {
        const empty = (c: Context) => c.next()
        const greet = (c: Context) => send.empty(c)
        const prepare = composer()
        const dispatch = prepare(true, empty, greet)
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

test('main composer multi handler, direct return in first handler, send.text :200', async (t) => {
    const url = await server((req, res) => {
        const greet = (c: Context) => send.text(c, 'hello')
        const never = (c: Context) => send.text(c, 'never')
        const prepare = composer()
        const dispatch = prepare(true, greet, never)
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

test('main composer multi handler, direct return in second handler, next() send.text :200>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next()
        const greet = (c: Context) => send.text(c, 'hello')
        const prepare = composer()
        const dispatch = prepare(true, next, greet)
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

test('main composer multi handlers, pass parameters with next(), next(string), send.text :200>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next('hello')
        const greet = (c: Context, message: string) => send.text(c, message)
        const prepare = composer()
        const dispatch = prepare(true, next, greet)
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

test('main composer multi handlers async, pass parameters with next(), next(string), send.text :200', async (t) => {
    const delay = (time: number, msg: string) => new Promise((r) => setTimeout(r, time, msg))
    const url = await server((req, res) => {
        const next = async (c: Context) => {
            const msg = await delay(2000, 'hello')
            c.next(msg)
        }
        const greet = (c: Context, message: string) => {
            t.is(message, 'hello')
            send.text(c, message)
        }
        const prepare = composer()
        const dispatch = prepare(true, next, greet)
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

