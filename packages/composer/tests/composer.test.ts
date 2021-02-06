import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import { server, createContext } from './helpers'
import { lazyComposer as composer } from '..'

test('main composer single handler, direct<string:200>', async (t) => {
    const url = await server((req, res) => {
        const greet = () => 'hello'
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

test('main composer single handler, direct<empty:204>', async (t) => {
    const url = await server((req, res) => {
        const empty = () => null
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

test('main composer multi handler, direct return in first handler, direct<empty:204>', async (t) => {
    const url = await server((req, res) => {
        const empty = () => null
        const greet = () => 'hello'
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

test('main composer multi handler, direct return in second handler, next<empty> direct<empty:204>', async (t) => {
    const url = await server((req, res) => {
        const empty = (c: Context) => c.next()
        const greet = () => null
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

test('main composer multi handler, direct return in first handler, direct<string:200>', async (t) => {
    const url = await server((req, res) => {
        const greet = () => 'hello'
        const never = () => 'never'
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

test('main composer multi handler, direct return in second handler, next<empty> direct<string:200>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next()
        const greet = () => 'hello'
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

test('main composer multi handler async, direct promise return in first handler, direct<Promise<string:200>', async (t) => {
    const url = await server((req, res) => {
        const greet = () => Promise.resolve('hello')
        const never = () => 'never'
        const prepare = composer()
        const dispatch = prepare(true, greet, never)
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

test('main composer multi handler async, direct promise return in second handler, next<empty>, direct<Promise<string:200>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next()
        const greet = () => Promise.resolve('hello')
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

test('main composer multi handlers, pass parameters whit next, next<string>, direct<string:200>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next('hello')
        const greet = (_, message: string) => message
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

test('main composer multi handlers async, pass parameters whit next, next<string>, direct<string:200>', async (t) => {
    const delay = (time: number, msg: string) => new Promise((r) => setTimeout(r, time, msg))
    const url = await server((req, res) => {
        const next = async (c: Context) => {
            const msg = await delay(2000, 'hello')
            c.next(msg)
        }
        const greet = (_, message: string) => {
            t.is(message, 'hello')
            return message
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

