import test from 'ava'
import qs from '..'

test('parse query string in the start', (t) => {
    type Query = {
        foo: string
        bar: string
    }

    const ctx = {
        req: {
            url: 'http://localhost:3000?foo=1&bar=2'
        }
    }

    const query = qs<Query>(ctx as any)
    t.is(query.foo, '1')
    t.is(query.bar, '2')
})

test('parse query string whit path', (t) => {
    type Query = {
        foo: string
        bar: string
    }

    const ctx = {
        req: {
            url: 'http://localhost:3000/some?foo=1&bar=2'
        }
    }

    const query = qs<Query>(ctx as any)
    t.is(query.foo, '1')
    t.is(query.bar, '2')
})

test('parse query string whit path and diferent concat char', (t) => {
    type Query = {
        foo: string
        bar: string
    }

    const ctx = {
        req: {
            url: 'http://localhost:3000/some?foo=1$bar=2'
        }
    }

    const query = qs<Query>(ctx as any, '$')
    t.is(query.foo, '1')
    t.is(query.bar, '2')
})

test('parse query string whit path and diferent assignment char', (t) => {
    type Query = {
        foo: string
        bar: string
    }

    const ctx = {
        req: {
            url: 'http://localhost:3000/some?foo#1&bar#2'
        }
    }

    const query = qs<Query>(ctx as any, undefined, '#')
    t.is(query.foo, '1')
    t.is(query.bar, '2')
})

