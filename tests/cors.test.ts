import test from 'ava'
import fetch from 'node-fetch'
import cors from 'wezi-cors'
import { server } from './helpers'

const methods = [
    'POST'
    , 'GET'
    , 'PUT'
    , 'PATCH'
    , 'DELETE'
    , 'OPTIONS'
]

test('adds default max age header only for OPTIONS request', async (t) => {
    const url = await server(cors(), () => null)
    for (const method of methods) {
        const res = await fetch(url, {
            method: 'OPTIONS'
        })
        if (method === 'OPTIONS') {
            const maxAgeHeader = res.headers.get('Access-Control-Max-Age')
            t.deepEqual(maxAgeHeader, '86400')
        }
        t.falsy(Object.keys(res.headers).includes('Access-Control-Max-Age'))
    }
})

test('adds configured max age header', async t => {
    const url = await server(cors({
        maxAge: 2000
    }), () => null)

    const res = await fetch(url, {
        method: 'OPTIONS'
    })

    const maxAgeHeader = res.headers.get('Access-Control-Max-Age')
    t.deepEqual(maxAgeHeader, '2000')
})

test('adds default allow origin header', async t => {
    const url = await server(cors(), () => null)
    for (const method of methods) {
        const res = await fetch(url, {
            method
        })

        const allowOriginHeader = res.headers.get('Access-Control-Allow-Origin')
        t.deepEqual(allowOriginHeader, '*')
    }
})

test('adds configured allow origin header', async t => {
    const url = await server(cors({
        origin: 'localhost'
    }), () => null)

    for (const method of methods) {
        const res = await fetch(url, {
            method
        })

        const allowOriginHeader = res.headers.get('Access-Control-Allow-Origin')
        t.deepEqual(allowOriginHeader, 'localhost')
    }
})

test('adds default allow methods header only for OPTIONS request', async t => {
    const url = await server(cors(), () => null)
    for (const method of methods) {
        const res = await fetch(url, {
            method
        })

        if (method === 'OPTIONS') {
            const allowMethodsHeader = res.headers.get('Access-Control-Allow-Methods')
            t.deepEqual(allowMethodsHeader, 'POST,GET,PUT,PATCH,DELETE,OPTIONS')
        }
        t.false(Object.keys(res.headers).includes('Access-Control-Allow-Methods'))
    }
})

test('adds configured allow methods header', async t => {
    const url = await server(cors({
        allowMethods: ['GET', 'POST']
    }), () => null)

    const res = await fetch(url, {
        method: 'OPTIONS'
    })

    const allowMethodsHeader = res.headers.get('Access-Control-Allow-Methods')
    t.deepEqual(allowMethodsHeader, 'GET,POST')
})

test('adds default allow headers header only for OPTIONS request', async t => {
    const url = await server(cors(), () => null)
    for (const method of methods) {
        const res = await fetch(url, {
            method
        })

        if (method === 'OPTIONS') {
            const allowMethodsHeader = res.headers.get('Access-Control-Allow-Headers')
            t.deepEqual(
                allowMethodsHeader
                , 'X-Requested-With,Access-Control-Allow-Origin,X-HTTP-Method-Override,Content-Type,Authorization,Accept'
            )
        }
        t.false(Object.keys(res.headers).includes('Access-Control-Allow-Headers'))
    }
})

test('adds configured allow headers header', async t => {
    const url = await server(cors({
        allowHeaders: ['GET', 'POST']
    }), () => null)

    const res = await fetch(url, {
        method: 'OPTIONS'
    })

    const allowMethodsHeader = res.headers.get('Access-Control-Allow-Headers')
    t.deepEqual(
        allowMethodsHeader
        , 'GET,POST'
    )
})

test('allows configured expose headers header', async t => {
    const url = await server(cors({
        exposeHeaders: ['GET']
    }), () => null)

    for (const method of methods) {
        const res = await fetch(url, {
            method
        })

        const exposeMethodsHeader = res.headers.get('Access-Control-Expose-Headers')
        t.deepEqual(
            exposeMethodsHeader
            , 'GET'
        )
    }
})

test('adds allow credentials header by default', async t => {
    const url = await server(cors(), () => null)
    for (const method of methods) {
        const res = await fetch(url, {
            method
        })

        const allowCredentialsHeader = res.headers.get('Access-Control-Allow-Credentials')
        t.deepEqual(allowCredentialsHeader, 'true')
    }
})

test('allows remove allow credentials header', async t => {
    const url = await server(cors({
        allowCredentials: false
    }), () => null)

    for (const method of methods) {
        const res = await fetch(url, {
            method
        })

        t.false(Object.keys(res.headers).includes('Access-Control-Allow-Credentials'))
    }
})
