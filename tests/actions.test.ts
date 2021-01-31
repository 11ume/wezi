import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import { redirect } from 'wezi-actions'
import { server } from './helpers'

test('redirect response', async (t) => {
    const fn = (c: Context) => {
        if (c.req.url === '/redirect') {
            c.res.end()
            return
        }
        redirect(c, '/redirect')
    }

    const url = await server(true, fn)
    const res = await fetch(url)
    t.true(res.redirected)
})
