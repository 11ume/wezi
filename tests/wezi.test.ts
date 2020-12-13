import test from 'ava'
import fetch from 'node-fetch'
import { Context } from 'wezi-types'
import wezi, { listen } from 'wezi'

test('server listen, direct<string:200>', async (t) => {
    const w = wezi(() => 'hello')
    await listen(w(), 3000)
    const res = await fetch('http://localhost:3000')
    const r = await res.text()

    t.is(r, 'hello')
})

test('Redirect response', async (t) => {
    const w = wezi((c: Context) => {
        if (c.req.url === '/redirect') {
            c.res.end()
            return
        }
        c.redirect('/redirect')
    })
    await listen(w(), 3001)
    const res = await fetch('http://localhost:3001')
    t.true(res.redirected)
})
