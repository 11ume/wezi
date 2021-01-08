import test from 'ava'
import fetch from 'node-fetch'
import { server, createContext } from './helpers'
import { composerTiny } from '..'

test('main composer tiny single handler, direct<string:200>', async (t) => {
    const url = await server((req, res) => {
        const greet = () => 'hello'
        const dispatch = composerTiny(greet)
        const context = createContext({
            req
            , res
        })

        dispatch(context)
    })

    const res = await fetch(url)
    const body = await res.text()

    t.is(res.status, 200)
    t.is(body, 'hello')
})
