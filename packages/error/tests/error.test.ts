import test from 'ava'
import { createError } from '..'

test('create http status simple error', (t) => {
    const err = createError(200, 'ok')
    t.is(err.code, 200)
    t.is(err.message, 'ok')
})

test('create http error whit message', (t) => {
    const err = createError(500, 'invalid json')
    t.is(err.code, 500)
    t.is(err.message, 'invalid json')
})

test('create http error whitout message', (t) => {
    const err = createError(400)
    t.is(err.message, '')
})

test('create http error from error', (t) => {
    const err = createError(500, null, new Error('Im the original error'))
    t.is(err.code, 500)
    t.is(err.originalError.message, 'Im the original error')
})

