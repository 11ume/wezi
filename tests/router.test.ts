import * as receive from 'wezi-receive'
import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi'
import { empty, json, text } from 'wezi-send'
import { createError } from 'wezi-error'
import router, {
    get
    , head
    , post
    , put
    , del
    , patch
    , route
} from 'wezi-router'
import { server } from './helpers'

test('base path', async (t) => {
    const greet = (c: Context) => text(c, 'hello')
    const r = router(
        get('/', greet)
    )
    const url = await server(r)
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, 'hello')
})

test('not found', async (t) => {
    const foo = (c: Context) => text(c, 'foo')
    const bar = (c: Context) => text(c, 'bar')
    const r = router(
        get('/foo', foo)
        , get('/bar', bar)
    )
    const notFound = (c: Context) => c.panic(createError(404))
    const url = await server(r, notFound)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 404)
    t.is(body.message, 'unknown')
})

test('pattern match /(.*)', async (t) => {
    const greet = (c: Context) => text(c, 'hello')
    const r = router(
        get('*', greet)
    )
    const url = await server(r)
    const res = await fetch(url)
    const resTwo = await fetch(url)
    const body = await res.text()
    const bodyTwo = await resTwo.text()

    t.is(res.status, 200)
    t.is(body, 'hello')

    t.is(resTwo.status, 200)
    t.is(bodyTwo, 'hello')
})

test('different routes whit static paths diferent methods (CRUD)', async (t) => {
    type Payload = {
        id: string
    }

    const responses = {
        getAll: 'get_all'
        , create: 'create'
        , put: 'put'
        , patch: 'patch'
        , delete: 'delete'
    }

    const r = router(
        get('/users', (c: Context) => text(c, responses.getAll))
        , get('/users/:id', (c: Context, params: Payload) => text(c, params.id))
        , post('/users', (c: Context) => text(c, responses.create))
        , put('/users', (c: Context) => text(c, responses.put))
        , patch('/users', (c: Context) => text(c, responses.patch))
        , del('/users', (c: Context) => text(c, responses.delete))
    )
    const url = await server(r)
    const getAllres = await fetch(`${url}/users`)
    const getByIdRes = await fetch(`${url}/users/1`)
    const createRes = await fetch(`${url}/users`, {
        method: 'post'
    })
    const putRes = await fetch(`${url}/users`, {
        method: 'put'
    })
    const patchRes = await fetch(`${url}/users`, {
        method: 'patch'
    })
    const daleteOneRes = await fetch(`${url}/users`, {
        method: 'delete'
    })

    const bodyAll = await getAllres.text()
    const bodyById = await getByIdRes.text()
    const bodyCreaste = await createRes.text()
    const bodyPatch = await patchRes.text()
    const bodyPut = await putRes.text()
    const bodyDelete = await daleteOneRes.text()

    t.deepEqual(bodyAll, responses.getAll)
    t.is(bodyById, '1')
    t.deepEqual(bodyCreaste, responses.create)
    t.deepEqual(bodyPut, responses.put)
    t.deepEqual(bodyPatch, responses.patch)
    t.deepEqual(bodyDelete, responses.delete)
})

test('different routes whit static paths, method get', async (t) => {
    const r = router(
        get('/foo', (c: Context) => json(c, {
            name: 'foo'
        }))
        , get('/bar', (c: Context) => json(c, {
            name: 'bar'
        }))
    )
    const url = await server(r)
    const resFoo = await fetch(`${url}/foo`)
    const resBar = await fetch(`${url}/bar`)

    const bodyFoo = await resFoo.json()
    const bodyBar = await resBar.json()

    t.is(resFoo.status, 200)
    t.is(bodyFoo.name, 'foo')

    t.is(resBar.status, 200)
    t.is(bodyBar.name, 'bar')
})

test('different routes whit return empty', async (t) => {
    const r = router(
        get('/foo', (c: Context) => empty(c))
    )
    const url = await server(r)
    const res = await fetch(`${url}/foo`)
    const body = await res.text()

    t.is(res.status, 204)
    t.falsy(body)
})

test('routes with multi params', async (t) => {
    type Payload = {
        foo: string
        bar: string
    }
    const greet = (c: Context, params: Payload) => text(c, `${params.foo} ${params.bar}`)
    const r = router(
        get('/hello/:foo/:bar', greet)
    )
    const url = await server(r)
    const res = await fetch(`${url}/hello/foo/bar`)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo bar')
})

test('multiple matching routes', async (t) => {
    const withPath = (c: Context) => text(c, 'Hello world')
    const withParam = () => t.fail('Clashing route should not have been called')

    const r = router(
        get('/path', withPath)
        , get('/:param', withParam)
    )
    const url = await server(r)
    const res = await fetch(`${url}/path`)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'Hello world')
})

test('match head, match route and return empty body', async (t) => {
    const ping = (c: Context) => text(c, 'hello')
    const r = router(
        head('/hello', ping)
    )
    const url = await server(r)
    const res = await fetch(`${url}/hello`, {
        method: 'head'
    })
    const body = await res.blob()

    t.is(res.status, 200)
    t.is(body.size, 0)
})

test('multiple routes handlers', async (t) => {
    type Payload = {
        name: string
    }
    const checkChar = (context: Context, payload: Payload) => {
        if (payload.name !== 'john') throw createError(400, 'Bad request')
        context.next(payload)
    }
    const getChar = (c: Context, params: Payload) => text(c, params.name)
    const r = router(
        get('/character/:name', checkChar, getChar)
    )
    const url = await server(r)
    const res = await fetch(`${url}/character/john`)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'john')
})

test('multiple routes handlers fail next', async (t) => {
    const checkChar = async (context: Context, payload: unknown) => {
        const char = await receive.json<{ name?: string, power?: string }>(context)
        if (char.name && char.power) context.next(payload)
        else throw createError(400, 'Bad request')
    }
    const getChar = (c: Context) => text(c, 'never')
    const r = router(
        post('/character', checkChar, getChar)
    )
    const url = await server(r)
    const res = await fetch(`${url}/character`, {
        method: 'post'
        , body: JSON.stringify({
            name: 't800'
        })
    })

    t.is(res.status, 400)
})

test('create route wiht namespace', async (t) => {
    const foo = (c: Context) => text(c, 'foo')
    const r = router(route('/foo')(get(foo)))
    const url = await server(r)
    const res = await fetch(`${url}/foo`)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo')
})

test('create route wiht namespace and two route entities', async (t) => {
    const foo = (c: Context, params: { id: string }) => text(c, params.id)
    const bar = (c: Context, params: { id: string }) => text(c, params.id)
    const r = router(route('/foo/:id')(get(foo), put(bar)))
    const url = await server(r)
    const res = await fetch(`${url}/foo/123`)
    const resPut = await fetch(`${url}/foo/321`, {
        method: 'put'
    })
    const body = await res.text()
    const bodyPut = await resPut.text()

    t.is(res.status, 200)
    t.is(resPut.status, 200)
    t.is(body, '123')
    t.is(bodyPut, '321')
})

test('create route wiht namespace with handler and two route entities', async (t) => {
    type Params = {
        id: string
        next: string
        pass: string
    }

    const next = (c: Context, params: { id: string }) => c.next({
        ...params
        , next: 'next'
    })
    const pass = (c: Context, params: { id: string }) => c.next({
        ...params
        , pass: 'pass'
    })
    const foo = (c: Context, params: Params) => json(c, params)
    const bar = (c: Context, params: { id: string }) => json(c, params)
    const r = router(route('/foo/:id', next, pass)(get(foo), get(bar)))
    const url = await server(r)
    const res = await fetch(`${url}/foo/123`)
    const resTwo = await fetch(`${url}/foo/321`)
    const body: Params = await res.json()
    const bodyTwo: Params = await resTwo.json()

    t.is(res.status, 200)
    t.is(resTwo.status, 200)
    t.deepEqual(body, {
        id: '123'
        , next: 'next'
        , pass: 'pass'
    })
    t.deepEqual(bodyTwo, {
        id: '321'
        , next: 'next'
        , pass: 'pass'
    })
})

