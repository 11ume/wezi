import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import { shareable } from 'wezi-shared'
import { createError, InternalError } from 'wezi-error'
import { server, createContext } from './helpers'
import composer from '..'

test.before('main composer prepare context', (t) => {
    const errorHandler = (context: Context, error: Partial<InternalError>) => {
        context.res.statusCode = error.statusCode ?? 500
        context.res.end(error.message)
    }
    shareable.errorHandler = errorHandler
    t.pass()
})

test('main composer multi handler async, direct promise error return in first handler, next<Error:400>', async (t) => {
    const url = await server((req, res) => {
        const check = (c: Context) => c.panic(createError(400))
        const never = () => Promise.resolve('hello')
        const dispatch = composer(true, check, never)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: string = await res.text()

    t.is(res.status, 400)
    t.is(body, 'Bad Request')
})

test('main composer multi handler async, direct promise error return in second handler, next<empty>, direct<Promise<Error>:400>', async (t) => {
    const url = await server((req, res) => {
        const next = (c: Context) => c.next()
        const greet = () => Promise.reject(createError(400))
        const dispatch = composer(true, next, greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: string = await res.text()

    t.is(res.status, 400)
    t.is(body, 'Bad Request')
})

test('main composer multi handler, throw error inside first handler, <Error>', async (t) => {
    const url = await server((req, res) => {
        const err = () => {
            throw new Error('Something wrong is happened')
        }
        const never = () => 'hello'
        const dispatch = composer(true, err, never)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: string = await res.text()

    t.is(body, 'Something wrong is happened')
    t.is(res.status, 500)
})

test('main composer call panic whiout pass an error, panic<not error type>', async (t) => {
    const url = await server((req, res) => {
        const dispatch = composer(true, (c: Context) => c.panic({
            foo: 'foo'
        } as any))
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body: string = await res.text()

    t.is(body, 'panic error param, must be instance of Error')
    t.is(res.status, 500)
})

