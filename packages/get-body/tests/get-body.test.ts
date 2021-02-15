import test from 'ava'
import net, { Socket } from 'net'
import http, { IncomingMessage, RequestListener, ServerResponse } from 'http'
import fetch from 'node-fetch'
import testListen from 'test-listen'
import fastGetBody from '..'
import { InternalError } from 'wezi-error'

const listen = (fn: RequestListener) => testListen(http.createServer(fn))

test('parse http request readable payload buffer', async (t) => {
    const message = JSON.stringify({
        foo: 'foo'
    }, null, 0)

    const messageLength = Buffer.byteLength(message)
    const url = await listen(async (req: IncomingMessage, res: ServerResponse) => {
        const { body } = await fastGetBody(req, true)
        t.true(body instanceof Buffer)
        res.end(body)
    })

    const res = await fetch(url, {
        method: 'POST'
        , body: message
    })

    const body = await res.text()
    t.is(res.status, 200)
    t.is(body, message)
    t.is(body.length, messageLength)
})

test('parse http request readable payload string', async (t) => {
    const message = 'foo'
    const messageLength = Buffer.byteLength(message)
    const url = await listen(async (req: IncomingMessage, res: ServerResponse) => {
        const { body } = await fastGetBody(req, false)
        t.is(typeof body, 'string')
        res.end(body)
    })

    const res = await fetch(url, {
        method: 'POST'
        , body: message
    })

    const body = await res.text()
    t.is(res.status, 200)
    t.is(body, message)
    t.is(body.length, messageLength)
})

test('parse http request readable throw error if connection is aborted', async (t) => {
    const abort = () => new Promise((resolve) => {
        let socket: Socket = null
        const server = http.createServer((req) => {
            resolve(fastGetBody(req, true))
            server.close()
            socket.destroy()
        })

        server.listen(() => {
            const adress = server.address()
            if (typeof adress !== 'string') {
                const port = adress.port.toString()
                socket = net.connect(port, () => {
                    socket.write('POST / HTTP/1.0\r\n')
                    socket.write('Connection: keep-alive\r\n')
                    socket.write('Content-Length: 5\r\n')
                    socket.write('\r\n')
                    socket.write('foo')
                    socket.end()
                })
            }
        })
    })

    const err = await t.throwsAsync<InternalError>(abort)
    t.is(err.code, 500)
    t.is(err.message, 'error on read body abort, received: 3')
})

test('parse http request readable invoke error event', async (t) => {
    const error = () => new Promise(async (resolve) => {
        const url = await listen(async (req: IncomingMessage, res: ServerResponse) => {
            resolve(fastGetBody(req, true))
            req.emit('error', new Error('error message'))
            res.end()
        })

        fetch(url, {
            method: 'POST'
            , body: 'foo'
        })
    })

    const err = await t.throwsAsync<InternalError>(error)
    t.is(err.message, 'error on read body, received: 0')
    t.is(err.originalError.message, 'error message')
    t.is(err.code, 500)
})

test('parse http request readable invoke on end error event', async (t) => {
    const error = () => new Promise(async (resolve) => {
        const url = await listen(async (req: IncomingMessage, res: ServerResponse) => {
            resolve(fastGetBody(req, true))
            req.emit('end', new Error('error message'))
            res.end()
        })

        fetch(url, {
            method: 'POST'
            , body: 'foo'
        })
    })

    const err = await t.throwsAsync<InternalError>(error)
    t.is(err.message, 'error on read body end, received: 0')
    t.is(err.originalError.message, 'error message')
    t.is(err.code, 500)
})
