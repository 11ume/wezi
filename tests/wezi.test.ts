import test from 'ava'
import fetch from 'node-fetch'
import wezi, { listen } from 'wezi'

test('server listen, direct<string:200>', async (t) => {
    const w = wezi(() => 'hello')
    await listen(w(), 3000)
    const res = await fetch('http://localhost:3000')
    const r = await res.text()

    t.is(r, 'hello')
})

