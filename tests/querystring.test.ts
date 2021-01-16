import test from 'ava'
import fetch from 'node-fetch'
import router, { get } from 'wezi-router'
import queryParser, { Payload } from 'wezi-query'
import { server } from './helpers'

test('get query string params', async (t) => {
    type Query = {
        name: string
        surname: string
    }

    const greet = (_c, { query }: Payload<void, Query>) => `${query.name} ${query.surname}`
    const r = router()
    const url = await server(r(get('/users', queryParser, greet)))
    const res = await fetch(`${url}/users?name=foo&surname=bar`)
    const body = await res.text()

    t.is(body, 'foo bar')
})

test('get query string params whit router params', async (t) => {
    type Params = {
        id: string
    }

    type Query = {
        name: string
        surname: string
    }

    const greet = (_c, { params, query }: Payload<Params, Query>) => `${params.id} ${query.name} ${query.surname}`
    const r = router()
    const url = await server(r(get('/users/:id', queryParser, greet)))
    const res = await fetch(`${url}/users/12?name=foo&surname=bar`)
    const body = await res.text()

    t.is(body, '12 foo bar')
})

