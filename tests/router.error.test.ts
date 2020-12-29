import test from 'ava'
import fetch from 'node-fetch'
import wezi, { Context, listen } from 'wezi'
import { InternalError } from 'wezi-error'
import router, { ContextRoute, get } from '../packages/router'
import { createError } from '../packages/error'

test('panic whit custom error handler', async (t) => {
    const foo = () => 'foo'
    const bar = () => 'bar'
    const r = router()
    const notFound = (c: ContextRoute) => c.panic(createError(404))
    const errorHandler = (context: Context, error: Partial<InternalError>) => {
        context.res.statusCode = error.statusCode ?? 500
        context.res.end(error.message)
    }

    const w = wezi(r(get('/foo', foo), get('/bar', bar)), notFound)
    await listen(w(null, errorHandler), 3000)
    const res = await fetch('http://localhost:3000/baz')
    const body = await res.text()

    t.is(res.status, 404)
    t.is(body, 'Not Found')
})
