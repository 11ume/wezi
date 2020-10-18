import http from 'http'
import createApp from 'application'
import router, { get } from 'router'

const getUserById = get('/user/:id', () => ({
    name: 'foo'
}))

const r = router(
    getUserById
)

const app = createApp(r)
http
    .createServer(app)
    .listen(5000)
