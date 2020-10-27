import test from 'ava'
import composer from '..'
import http, { IncomingMessage, ServerResponse } from 'http'
import listen from 'test-listen'
import fetch from 'node-fetch'

const server = (fn: (req: IncomingMessage, res: ServerResponse) => void) => {
    return listen(http.createServer((req, res) => fn(req, res)))
}

test('main composer flow', async (t) => {
    const url = await server((req, res) => {
        const handler = () => 'hello'
        const dispatch = composer(true, handler)
        const context = {
            req
            , res
            , error: null
            , errorHandler: null
        }

        dispatch(context)
    })

    const res = await fetch(`${url}/`)
    const r = await res.text()
    t.is(r, 'hello')
})