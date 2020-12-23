import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import { InternalError, createError } from 'wezi-error'
import wezi, { listen } from 'wezi'

test('create custom error handler', async (t) => {
    const w = wezi(({ panic }: Context) => panic(createError(400)), () => 'hello')
    const errorHandler = (context: Context, error: Partial<InternalError>) => {
        context.res.statusCode = error.statusCode ?? 500
        context.res.end(error.message)
    }

    await listen((req, res) => w(req, res, errorHandler), 3000)
    const res = await fetch('http://localhost:3000')
    const r = await res.text()

    t.is(res.status, 400)
    t.is(r, 'Bad Request')
})
