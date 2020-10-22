import http from 'http'
import wuok from 'wuok'
import router, { ContextRoute, withNamespace, get } from './index'

const hello = (ctx: ContextRoute<{ msg: string }, { time: number }>) => `Hello ${ctx.params.msg} ${ctx.query.time}`
const v1 = withNamespace('/v1')
const v2 = withNamespace('/v2')

const r = router(
    v1(get('/hello/:msg', hello))
    , v2(get('/hello/:msg', hello))
)

const server = http.createServer(wuok(r))
server.listen(5000)

