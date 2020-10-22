import test from 'ava'
import http from 'http'
import wuok, { RequestListener } from 'wuok'
import router, { ContextRoute, get } from '..'
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

    const f = await fooGet.json()
    const b = await barGet.json()

    t.is(f.name, 'foo')
    t.is(b.name, 'bar')
})

test('routes with params and query', async (t) => {
    const hello = (ctx: ContextRoute<{ msg: string }, { time: number }>) => `Hello ${ctx.params.msg} ${ctx.query.time}`
    const routes = router(get('/hello/:msg', hello))
    const url = await server(routes)

    const response = await fetch(`${url}/hello/world?time=now`)
    const r = await response.text()

    t.is(r, 'Hello world now')
})