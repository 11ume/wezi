import test from 'ava'
import fs from 'fs'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import { Context } from 'wezi-types'
import { server } from './helpers'
import {
    send
    , empty
    , buffer
    , stream
} from 'wezi-send'

test('send text string message', async (t) => {
    const fn = (c: Context) => send(c, 200, 'hello')

    const url = await server(true, fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, 'hello')
    t.is(res.headers.get('Content-Length'), '5')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('send text number message', async (t) => {
    const fn = (c: Context) => send(c, 200, 1)

    const url = await server(true, fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(body, '1')
    t.is(res.headers.get('Content-Length'), '1')
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
})

test('send json message', async (t) => {
    const fn = (c: Context) => send(c, 200, {
        message: 'hello'
    })

    const url = await server(true, fn)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 200)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Length'), '19')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('send empty', async (t) => {
    const fn = (c: Context) => empty(c)

    const url = await server(true, fn)
    const res = await fetch(url)
    t.is(res.status, 204)
})

test('send payload whit status code', async (t) => {
    const fn = (c: Context) => send(c, 401, {
        message: 'hello'
    })

    const url = await server(true, fn)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 401)
    t.is(body.message, 'hello')
    t.is(res.headers.get('Content-Length'), '19')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
})

test('send direct lazy message', async (t) => {
    const fn = () => 'hello'

    const url = await server(true, fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Type'), 'text/plain charset=utf-8')
    t.is(res.headers.get('Content-Length'), '5')
    t.is(body, 'hello')
})

test('send direct lazy json', async (t) => {
    const fn = () => ({
        message: 'hello'
    })

    const url = await server(true, fn)
    const res = await fetch(url)
    const body: { message: string } = await res.json()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Length'), '19')
    t.is(res.headers.get('Content-Type'), 'application/json charset=utf-8')
    t.is(body.message, 'hello')
})

test('send direct lazy buffer', async (t) => {
    const fn = () => Buffer.from('foo')

    const url = await server(true, fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Length'), '3')
    t.is(res.headers.get('Content-Type'), 'application/octet-stream')
    t.is(body, 'foo')
})

test('send direct lazy readable', async (t) => {
    const readable = new Readable()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    readable._read = () => { }
    readable.push('foo')
    readable.push(',bar')
    readable.push(null)

    const fn = () => readable

    const url = await server(true, fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Type'), 'application/octet-stream')
    t.is(body, 'foo,bar')
})

test('send direct lazy Not Content 204', async (t) => {
    const fn = () => null

    const url = await server(true, fn)
    const res = await fetch(url)

    t.is(res.status, 204)
})

test('send stream readable', async (t) => {
    const readable = new Readable()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    readable._read = () => { }
    readable.push('foo')
    readable.push(null)

    const fn = (c: Context) => stream(c, 200, readable)
    const url = await server(true, fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Type'), 'application/octet-stream')
    t.is(body, 'foo')
})

test('send file read stream', async (t) => {
    const readable = fs.createReadStream('./package.json')
    const fn = (c: Context) => stream(c, 200, readable)

    const url = await server(true, fn)
    const res = await fetch(url)
    const body: { repository: string } = await res.json()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Type'), 'application/octet-stream')
    t.is(body.repository, '11ume/wezi')
})

test('send buffer', async (t) => {
    const fn = (c: Context) => buffer(c, 200, Buffer.from('foo'))

    const url = await server(true, fn)
    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(res.headers.get('Content-Type'), 'application/octet-stream')
    t.is(res.headers.get('Content-Length'), '3')
    t.is(body, 'foo')
})

test('send must throws error when is invoked whit invalid content', async (t) => {
    type ErrorPayload = {
        message: string
    }

    const fn = (c: Context) => send(c, 400, Symbol('test'))

    const url = await server(true, fn)
    const res = await fetch(url)
    const body: ErrorPayload = await res.json()

    t.is(res.status, 500)
    t.is(body.message, 'cannot send, payload is not a valid')
})
