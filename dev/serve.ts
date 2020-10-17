import http from 'http'
import createApp from 'application'
import router, { get } from 'router'

const r = router(
    get('/', () => {
        return 'foo'
    })
)

const app = createApp([r])
http
    .createServer(app)
    .listen(5000)
