import http from 'http'
import createApp from 'application'
import { send } from 'senders'
import router, { get } from 'router'

type Params = {
    email: string
}

const getUserById = get<Params>('/user/:id', (req) => {
    return req.params
})

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
