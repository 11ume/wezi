import http from 'http'
import wuok from 'wuok'
import router, { ContextRoute, get } from './index'

const r = router(
    get('/users', () => [1, 2, 3])
    , get('/users/:id', (ctx: ContextRoute<{id: string}>) => ctx.params.id)
)

const server = http.createServer(wuok(r))
server.listen(5000)

