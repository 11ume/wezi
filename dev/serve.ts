import http from 'http'
import createApp from 'application'
import { send } from 'senders'
import router, { get } from 'router'

const getUserById = get('/user/:id', () => ({
    name: 'foo'
}))

const notFound = (_req, res) => {
    return send(res, 404)
}

const r = router(
    getUserById
    , notFound
)

const app = createApp(r)
http
    .createServer(app)
    .listen(5000)
