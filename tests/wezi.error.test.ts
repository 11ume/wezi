import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import { InternalError, createError } from 'wezi-error'
import { serverError } from './helpers'

test('create custom error handler', async (t) => {
    const errorHandler = (context: Context, error: Partial<InternalError>) => {
        context.res.statusCode = error.statusCode ?? 500
        context.res.end(error.message)
    }

    const url = await serverError(errorHandler, ({ panic }: Context) => panic(createError(400)), () => 'never')
    const res = await fetch(url)
    const r = await res.text()

    t.is(res.status, 400)
    t.is(r, 'Bad Request')
})
