import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi'
import { InternalError } from 'wezi-error'
import router, { ContextRouter, get } from '../packages/router'
import { createError } from '../packages/error'
import { serverError } from './helpers/index'

test('panic whit custom error handler', async (t) => {
    const foo = () => 'foo'
    const bar = () => 'bar'
    const r = router()
    const notFound = (c: ContextRouter) => c.panic(createError(404))
    const errorHandler = (context: Context, error: Partial<InternalError>) => {
        context.res.statusCode = error.statusCode ?? 500
        context.res.end(error.message)
    }

    const server = await serverError(errorHandler, r(get('/foo', foo), get('/bar', bar)), notFound)
    const res = await fetch(server + '/baz')
    const body = await res.text()

    t.is(res.status, 404)
    t.is(body, 'Not Found')
})
