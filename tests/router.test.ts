import * as receive from 'wezi-receive'
import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import { createError } from 'wezi-error'
import {
    get
    , head
    , post
    , put
    , del
    , patch
    , router
} from 'wezi'
import { server } from './helpers'

test('base path', async (t) => {
    const greet = () => 'hello'
    const r = router(
        get('/', greet)
    )
    const url = await server(r)
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, 'hello')
})

test('not found', async (t) => {
    const foo = () => 'foo'
    const bar = () => 'bar'
    const r = router(
        get('/foo', foo)
        , get('/bar', bar)
    )
    const notFound = (c: Context) => c.panic(createError(404))
    const url = await server(r, notFound)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 404)
    t.is(body.message, 'Not Found')
})

test('pattern match /(.*)', async (t) => {
    const greet = () => 'hello'
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
        get('/users', () => responses.getAll)
        , get('/users/:id', (_: Context, params: Payload) => params.id)
        , post('/users', () => responses.create)
        , put('/users', () => responses.put)
        , patch('/users', () => responses.patch)
        , del('/users', () => responses.delete)
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
        get('/foo', () => ({
            name: 'foo'
        }))
        , get('/bar', () => ({
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

test('different routes whit return null', async (t) => {
    const r = router(
        get('/foo', () => null)
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
    const greet = (_context: Context, params: Payload) => `${params.foo} ${params.bar}`
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
    const withPath = () => 'Hello world'
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
    const ping = () => 'hello'
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
    const getChar = (_context: Context, params: Payload) => params.name
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
    const getChar = () => null
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
