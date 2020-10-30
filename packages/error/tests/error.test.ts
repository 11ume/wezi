import test from 'ava'
import createError, { error } from '..'

test('create http status simple error', (t) => {
    const err = createError(200)
    t.is(err.message, 'OK')
})

test('create http status invalid status code', (t) => {
    const err = () => createError(5000)
    const e = t.throws(err)
    t.is(e.message, 'Invalid status code 5000')
})

test('create http error whit message', (t) => {
    const err = createError(500, 'Invalid JSON')
    t.is(err.message, 'Invalid JSON')
})

test('create http error from error', (t) => {
    const err = createError(500, null, new Error('Im a error'))
    t.is(err.message, 'Im a error')
})

test('create simple error', (t) => {
    const err = error(new Error('Im a error'))
    t.is(err.message, 'Im a error')
})