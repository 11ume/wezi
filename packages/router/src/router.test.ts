import test from 'ava'
import http from 'http'
import wuok, { RequestListener } from 'wuok'
import router, { ContextRoute, withNamespace, get } from '..'
import listen from 'test-listen'
import fetch from 'node-fetch'

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
    const hello = (ctx: ContextRoute<{ id: string }>) => `Hello ${ctx.params.id ?? ''}`
    const routes = router(get('/path/:id?', hello))
    const url = await server(routes)
    const res = await fetch(`${url}/path`)
    const resOptional = await fetch(`${url}/path/1`)
    const r = await res.text()
    const rOptional = await resOptional.text()

    t.is(r, 'Hello')
    t.is(rOptional, 'Hello world')
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
