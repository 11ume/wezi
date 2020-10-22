import http from 'http'
import wuok from 'wuok'
import router, { ContextRoute, get } from './index'

const hello = (ctx: ContextRoute<{ msg: string }, { time: number }>) => `Hello ${ctx.params.msg} ${ctx.query.time}`

const r = router(
    get('/hello/:msg', hello)
)

const server = http.createServer(wuok(r))
server.listen(5000)

