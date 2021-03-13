import test from 'ava'
import fs from 'fs'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import { Context } from 'wezi-types'
import { server } from './helpers'
import {
    empty
    , text
    , json
    , buffer
    , stream
} from 'wezi-send'

test('send text string message', async (t) => {
    const fn = (c: Context) => text(c, 'hello')

    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, 'hello')
    t.is(res.headers.get('Content-Length'), '5')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('send text number message', async (t) => {
    const fn = (c: Context) => text(c, '1')

    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, '1')
    t.is(res.headers.get('Content-Length'), '1')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('send json message', async (t) => {
    const fn = (c: Context) => json(c, {
        message: 'hello'
    })

    const url = await server(fn)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 200)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Length'), '19')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('send empty', async (t) => {
    const fn = (c: Context) => empty(c)

    const url = await server(fn)
    const res = await fetch(url)
    t.is(res.status, 204)
})

test('send payload with status code', async (t) => {
    const fn = (c: Context) => json(c, {
        message: 'hello'
    }, 401)

    const url = await server(fn)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 401)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Length'), '19')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('send stream readable', async (t) => {
    const readable = new Readable()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    readable._read = () => { }
    readable.push('foo')
    readable.push(null)

    const fn = (c: Context) => stream(c, readable)
    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Type'), 'application/octet-stream')
    t.is(body, 'foo')
})

test('send file read stream', async (t) => {
    const readable = fs.createReadStream('./package.json')
    const fn = (c: Context) => stream(c, readable)

    const url = await server(fn)
    const res = await fetch(url)
    const body: { repository: string } = await res.json()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Type'), 'application/octet-stream')
    t.is(body.repository, '11ume/wezi')
})

test('send buffer', async (t) => {
    const fn = (c: Context) => buffer(c, Buffer.from('foo'))

    const url = await server(fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Type'), 'application/octet-stream')
    t.is(res.headers.get('Content-Length'), '3')
    t.is(body, 'foo')
})

test('send must throws error when is invoked with invalid content', async (t) => {
    type ErrorPayload = {
        message: string
    }

    const fn = (c: Context) => text(c, {
        foo: 'foo'
    } as any)

    const url = await server(fn)
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received an instance of Object')
})
