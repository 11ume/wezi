import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi'
import router, { get } from 'wezi-router'
import queryParser from 'wezi-query'
import { server } from './helpers'

test('get query string params', async (t) => {
    type Query = {
        name: string
        surname: string
    }

    const greet = (c: Context) => {
        const query = queryParser<Query>(c)
        return `${query.name} ${query.surname}`
    }
    const url = await server(true, greet)
    const res = await fetch(`${url}/users?name=foo&surname=bar`)
    const body = await res.text()

    t.is(body, 'foo bar')
})

test('get query string params whit router flow', async (t) => {
    type Query = {
        name: string
        surname: string
    }

    const greet = (c: Context) => {
        const query = queryParser<Query>(c)
        return `${query.name} ${query.surname}`
    }
    const r = router(
        get('/users', greet)
    )
    const url = await server(true, r)
    const res = await fetch(`${url}/users?name=foo&surname=bar`)
    const body = await res.text()

    t.is(body, 'foo bar')
})

