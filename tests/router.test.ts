import test from 'ava'
import fetch from 'node-fetch'
import { createError } from 'wezi-error'
import { Context } from 'wezi-types'
import * as receive from 'wezi-receive'
import router, {
    ParamsWildcardPayload
    , routes
    , get
    , head
    , post
    , put
    , del
    , patch
} from 'wezi-router'
import { server } from './helpers'

test('base path', async (t) => {
    const greet = () => 'hello'
    const r = router()
    const url = await server(r(get('/', greet)))
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, 'hello')
})

test('not found', async (t) => {
    const foo = () => 'foo'
    const bar = () => 'bar'
    const r = router()
    const rh = r(get('/foo', foo), get('/bar', bar))
    const notFound = (c: Context) => c.panic(createError(404))
    const url = await server(rh, notFound)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 404)
    t.is(body.message, 'Not Found')
})

test('pattern match /(.*)', async (t) => {
    const greet = () => 'hello'
    const r = router()
    const url = await server(r(get('*', greet)))
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
        params: {
            id: string
        }
    }

    const responses = {
        getAll: 'get_all'
        , create: 'create'
        , put: 'put'
        , patch: 'patch'
        , delete: 'delete'
    }

    const r = router()
    const url = await server(r(
        get('/users', () => responses.getAll)
        , get('/users/:id', (_: Context, { params }: Payload) => params.id)
        , post('/users', () => responses.create)
        , put('/users', () => responses.put)
        , patch('/users', () => responses.patch)
        , del('/users', () => responses.delete)
    ))
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
    const r = router()
    const url = await server(r(
        get('/foo', () => ({
            name: 'foo'
        }))
        , get('/bar', () => ({
            name: 'bar'
        }))
    ))
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
    const r = router()
    const url = await server(r(
        get('/foo', () => null)
    ))
    const res = await fetch(`${url}/foo`)
    const body = await res.text()

    t.is(res.status, 204)
    t.falsy(body)
})

test('routes with multi params', async (t) => {
    type Payload = {
        params: {
            foo: string
            bar: string
        }
    }
    const greet = (_context: Context, { params }: Payload) => `${params.foo} ${params.bar}`
    const r = router()
    const url = await server(r(
        get('/hello/:foo/:bar', greet)
    ))
    const res = await fetch(`${url}/hello/foo/bar`)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo bar')
})

test('routes with matching optional param', async (t) => {
    type Payload = {
        params: {
            msg: string
        }
    }
    const greet = (_context: Context, { params }: Payload) => `Hello ${params.msg ?? ''}`
    const r = router()
    const url = await server(r(
        get('/path/:msg?', greet)
    ))
    const res = await fetch(`${url}/path`)
    const resOptional = await fetch(`${url}/path/world`)
    const body = await res.text()
    const bodyOptional = await resOptional.text()

    t.is(res.status, 200)
    t.is(body, 'Hello ')

    t.is(resOptional.status, 200)
    t.is(bodyOptional, 'Hello world')
})

test('routes with matching double optional params', async (t) => {
    type Payload = {
        params: {
            foo?: string
            bar?: string
        }
    }
    const greet = (_context: Context, { params }: Payload) => {
        if (params.foo && params.bar) return `Hello ${params.foo} ${params.bar}`
        else if (params.foo) return `Hello ${params.foo}`
        else return 'Hello'
    }

    const r = router()
    const url = await server(r(
        get('/path/:foo?/:bar?', greet)
    ))
    const res = await fetch(`${url}/path`)
    const resOptional = await fetch(`${url}/path/john`)
    const resOptionalWhitTwo = await fetch(`${url}/path/john/connor`)

    const body = await res.text()
    const bodyOptional = await resOptional.text()
    const bodyOptionalWhitTwo = await resOptionalWhitTwo.text()

    t.is(res.status, 200)
    t.is(body, 'Hello')

    t.is(resOptional.status, 200)
    t.is(bodyOptional, 'Hello john')

    t.is(resOptionalWhitTwo.status, 200)
    t.is(bodyOptionalWhitTwo, 'Hello john connor')
})

test('routes with matching params last optional only', async (t) => {
    type Payload = {
        params: {
            foo: string
            bar?: string
        }
    }
    const greet = (_context: Context, { params }: Payload) => {
        if (params.bar) return `Hello ${params.foo} ${params.bar}`
        else return `Hello ${params.foo}`
    }

    const r = router()
    const url = await server(r(
        get('/path/:foo/:bar?', greet)
    ))
    const resOptional = await fetch(`${url}/path/john`)
    const resOptionalWhitLast = await fetch(`${url}/path/john/connor`)

    const bodyOptional = await resOptional.text()
    const bodyOptionalWhitLast = await resOptionalWhitLast.text()

    t.is(resOptional.status, 200)
    t.is(bodyOptional, 'Hello john')

    t.is(resOptionalWhitLast.status, 200)
    t.is(bodyOptionalWhitLast, 'Hello john connor')
})

test('routes with matching params first optional only', async (t) => {
    type Payload = {
        params: {
            foo?: string
            bar: string
        }
    }
    const greet = (_context: Context, { params }: Payload) => {
        if (params.foo) return `Hello ${params.foo} ${params.bar}`
        else return `Hello ${params.bar}`
    }

    const r = router()
    const url = await server(r(
        get('/path/:foo?/:bar', greet)
    ))
    const resOptional = await fetch(`${url}/path/john`)
    const resOptionalAll = await fetch(`${url}/path/john/connor`)
    const resOptionalFirst = await fetch(`${url}/path/connor`)

    const bodyOptional = await resOptional.text()
    const bodyOptionalAll = await resOptionalAll.text()
    const bodyOptionalFirst = await resOptionalFirst.text()

    t.is(resOptional.status, 200)
    t.is(bodyOptional, 'Hello john')

    t.is(resOptionalAll.status, 200)
    t.is(bodyOptionalAll, 'Hello john connor')

    t.is(resOptionalFirst.status, 200)
    t.is(bodyOptionalFirst, 'Hello connor')
})

test('multiple matching routes', async (t) => {
    const withPath = () => 'Hello world'
    const withParam = () => t.fail('Clashing route should not have been called')

    const r = router()
    const url = await server(r(
        get('/path', withPath)
        , get('/:param', withParam)
    ))
    const res = await fetch(`${url}/path`)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'Hello world')
})

test('with main namespace', async (t) => {
    const handler = get('/path', () => 'foo')
    const v1 = router('/v1')
    const v2 = router('/v2')

    const url = await server(v1(handler), v2(handler))
    const res1 = await fetch(`${url}/v1/path`)
    const res2 = await fetch(`${url}/v2/path`)
    const body1 = await res1.text()
    const body2 = await res2.text()

    t.is(res1.status, 200)
    t.is(body1, 'foo')
    t.is(res2.status, 200)
    t.is(body2, 'foo')
})

test('compose routes with routes function', async (t) => {
    const route = routes()(get('/foo', () => 'foo'))
    const r = router()
    const url = await server(r(route))
    const res = await fetch(`${url}/foo`)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo')
})

test('with sub namespace', async (t) => {
    const route = routes('/path')(get('/foo', () => 'foo'))
    const r = router()
    const url = await server(r(route))
    const res = await fetch(`${url}/path/foo`)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'foo')
})

test('match head, match route and return empty body', async (t) => {
    const ping = () => 'hello'
    const r = router()
    const url = await server(r(
        head('/hello', ping)
    ))
    const res = await fetch(`${url}/hello`, {
        method: 'head'
    })
    const body = await res.blob()

    t.is(res.status, 200)
    t.is(body.size, 0)
})

test('multiple matching routes match whit wildcards', async (t) => {
    const getChar = (_context: Context, { params }: ParamsWildcardPayload) => params.wild
    const r = router()
    const url = await server(r(
        get('/character/*', getChar)
    ))
    const res = await fetch(`${url}/character/john/connor`)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'john/connor')
})

test('multiple routes handlers', async (t) => {
    type Payload = {
        params: {
            name: string
        }
    }
    const checkChar = (context: Context, payload: Payload) => {
        if (payload.params.name !== 'john') throw createError(400, 'Bad request')
        context.next(payload)
    }
    const getChar = (_context: Context, { params }: Payload) => params.name
    const r = router()
    const url = await server(r(
        get('/character/:name', checkChar, getChar)
    ))
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
    const r = router()
    const url = await server(r(
        post('/character', checkChar, getChar)
    ))
    const res = await fetch(`${url}/character`, {
        method: 'post'
        , body: JSON.stringify({
            name: 't800'
        })
    })

    t.is(res.status, 400)
})
