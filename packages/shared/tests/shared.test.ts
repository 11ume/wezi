import test from 'ava'
import { shared } from '..'

type Sharable = {
    foo: string
    bar: number
    baz?: string
};

const pointer = {
    req: {}
}

test('set propery and get property', (t) => {
    const sharable = shared<Sharable>(pointer as any)
    sharable.set('foo', '123')
    const value = sharable.get('foo')
    t.is(value, '123')
})

test('set same propery', (t) => {
    const sharable = shared<Sharable>(pointer as any)
    sharable.set('foo', '123')
    sharable.set('foo', '321')
    const value = sharable.get('foo')
    t.is(value, '321')
})

test('get inexistent propery key', (t) => {
    const sharable = shared<Sharable>(pointer as any)
    const value = sharable.get('baz')
    t.is(value, undefined)
})

test('remove propery', (t) => {
    const sharable = shared<Sharable>(pointer as any)
    sharable.set('foo', '123')
    const value = sharable.get('foo')
    t.is(value, '123')
    const result = sharable.remove('foo')
    t.true(result)
})

test('remove inexistent propery', (t) => {
    const sharable = shared<Sharable>(pointer as any)
    const value = sharable.remove('baz')
    t.false(value)
})

test('get all values', (t) => {
    const sharable = shared<Sharable>(pointer as any)
    sharable.set('foo', '123')
    sharable.set('bar', 123)
    const values = sharable.values()
    t.deepEqual(values, {
        foo: '123'
        , bar: 123
    })
})

test('get get value after delete reference', (t) => {
    const sharable = shared<Sharable>(pointer as any)
    sharable.set('foo', '123')
    const value = sharable.get('foo')
    t.is(value, '123')

    delete pointer.req
    const err: Error = t.throws(() => sharable.get('foo'))
    t.is(err.message, 'Cannot use \'in\' operator to search for \'foo\' in undefined')
})
