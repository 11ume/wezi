import test from 'ava'
import http from 'http'
import wezi from 'wezi'
import { Handler, Context } from 'wezi-types'
import listen from 'test-listen'
import fetch from 'node-fetch'

const server = (fn: Handler) => {
    const app = wezi(fn)
    return listen(http.createServer(app()))
}

test('recibe json', async (t) => {
    type Characters = {
        name: string
    }

    const fn = async (c: Context) => {
        const characters = await json<Characters[]>(c)
        return characters.map((char) => char.name)
    }
    const url = await server(fn)
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify([
            {
                name: 't800'
            },
            {
                name: 'John Connor'
            }
        ])
    })

    const body: string[] = await res.json()

    t.is(res.headers.get('content-type'), 'application/json charset=utf-8')
    t.is(body[0], 't800')
    t.is(body[1], 'John Connor')
})
