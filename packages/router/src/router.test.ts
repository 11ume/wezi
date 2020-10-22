import test from 'ava'
import http from 'http'
import wuok, { RequestListener } from 'wuok'
import router, { ContextRoute, withNamespace, get } from '..'
import listen from 'test-listen'
import fetch from 'node-fetch'
import { head } from './route'

const server = (fn: RequestListener) => listen(http.createServer(wuok(fn)))

test('different routes whit method get', async (t) => {
    const routes = router(
        get('/foo', () => ({ name: 'foo' }))
        , get('/bar', () => ({ name: 'bar' }))
    )

    const url = await server(routes)
    const fooGet = await fetch(`${url}/foo`)
    const barGet = await fetch(`${url}/bar`)

    const resFoo = await fooGet.json()
    const resBar = await barGet.json()

    t.is(resFoo.name, 'foo')
    t.is(resBar.name, 'bar')
})

test('routes with params and query', async (t) => {
    const hello = (ctx: ContextRoute<{ msg: string }, { time: number }>) => `Hello ${ctx.params.msg} ${ctx.query.time}`
    const routes = router(get('/hello/:msg', hello))
    const url = await server(routes)

    const res = await fetch(`${url}/hello/world?time=now`)
    const r = await res.text()

    t.is(r, 'Hello world now')
})

test('routes with multi params', async (t) => {
    const hello = (ctx: ContextRoute<{ foo: string, bar: string }>) => `${ctx.params.foo} ${ctx.params.bar}`

    const routes = router(get('/hello/:foo/:bar', hello))
    const url = await server(routes)
    const res = await fetch(`${url}/hello/foo/bar`)
    const r = await res.text()

    t.is(r, 'foo bar')
})

test('routes with matching optional param', async t => {
    const hello = (ctx: ContextRoute<{ msg: string }>) => `Hello ${ctx.params.msg ?? ''}`
    const routes = router(get('/path/:msg?', hello))
    const url = await server(routes)
    const res = await fetch(`${url}/path`)
    const resOptional = await fetch(`${url}/path/world`)
    const r = await res.text()
    const rOptional = await resOptional.text()

    t.is(r, 'Hello ')
    t.is(rOptional, 'Hello world')
})

test('routes with matching double optional params', async t => {
    const hello = (ctx: ContextRoute<{ foo?: string, bar?: string }>) => {
        if (ctx.params.foo && ctx.params.bar)
        return `Hello ${ctx.params.foo} ${ctx.params.bar}`
        else if (ctx.params.foo) return `Hello ${ctx.params.foo}`
        else return 'Hello'
    }

    const routes = router(get('/path/:foo?/:bar?', hello))
    const url = await server(routes)
    const res = await fetch(`${url}/path`)
    const resOptional = await fetch(`${url}/path/john`)
    const resOptionalWhitTwo = await fetch(`${url}/path/john/connor`)
    
    const r = await res.text()
    const rOptional = await resOptional.text()
    const rOptionalWhitTwo = await resOptionalWhitTwo.text()

    t.is(r, 'Hello')
    t.is(rOptional, 'Hello john')
    t.is(rOptionalWhitTwo, 'Hello john connor')
})

test('routes with matching params last optional only', async t => {
    const hello = (ctx: ContextRoute<{ foo: string, bar?: string }>) => {
        if(ctx.params.bar) 
        return `Hello ${ctx.params.foo} ${ctx.params.bar}`
        else return `Hello ${ctx.params.foo}`
    }

    const routes = router(get('/path/:foo/:bar?', hello))
    const url = await server(routes)
    const resOptional = await fetch(`${url}/path/john`)
    const resOptionalWhitLast = await fetch(`${url}/path/john/connor`)
    
    const rOptional = await resOptional.text()
    const rOptionalWhitLast = await resOptionalWhitLast.text()

    t.is(rOptional, 'Hello john')
    t.is(rOptionalWhitLast, 'Hello john connor')
})

test('routes with matching params first optional only', async t => {
    const hello = (ctx: ContextRoute<{ foo?: string, bar: string }>) => {
        if (ctx.params.foo) 
        return `Hello ${ctx.params.foo} ${ctx.params.bar}`
        else return `Hello ${ctx.params.bar}`
    }

    const routes = router(get('/path/:foo?/:bar', hello))
    const url = await server(routes)
    const resOptional = await fetch(`${url}/path/john`)
    const resOptionalFirst = await fetch(`${url}/path/connor`)
    const resOptionalAll = await fetch(`${url}/path/john/connor`)
    
    const rOptional = await resOptional.text()
    const rOptionalAll = await resOptionalAll.text()
    const rOptionalFirst = await resOptionalFirst.text()

    t.is(rOptional, 'Hello john')
    t.is(rOptionalAll, 'Hello john connor')
    t.is(rOptionalFirst, 'Hello connor')
})

test('multiple matching routes', async t => {
    const withPath = () => 'Hello world'
    const withParam = () => t.fail('Clashing route should not have been called')

    const routes = router(get('/path', withPath), get('/:param', withParam))
    const url = await server(routes)
    const res = await fetch(`${url}/path`)
    const r = await res.text()

    t.is(r, 'Hello world')
})

test('routes with namespace', async t => {
    const v1 = withNamespace('/v1')
    const v2 = withNamespace('/v2')

    const routes = router(
        v1(get('/test', () => 'foo'))
        , v2(get('/test', () => 'bar'))
    )

    const url = await server(routes)
    const fooGet = await fetch(`${url}/v1/test`)
    const barGet = await fetch(`${url}/v2/test`)
    const fooRes = await fooGet.text()
    const barRes = await barGet.text()

    t.is(fooRes, 'foo')
    t.is(barRes, 'bar')
})

test('match head, match route and return empty body', async t => {
    const ping = () => 'hello'
    const routes = router(head('/hello', ping))
    const url = await server(routes)
    const res = await fetch(`${url}/hello`, { method: 'head' })
    const r = await res.blob()

    t.is(r.size, 0)
    t.is(res.status, 200)
})

// wildcards not working
// test('multiple matching routes match whit wildcards', async t => {
//     const hello = () => `Hello`

//     const routes = router(get('/users/*', hello))
//     const url = await server(routes)
//     const res = await fetch(`${url}/users`)
//     const resWild = await fetch(`${url}/users/any`)

//     const r = await res.text()
//     const rWild = await resWild.text()
    
//     t.is(r, 'Hello')
//     t.is(rWild, 'Hello')
// })

// next test /:id