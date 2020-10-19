import http from 'http'
import createApp, { Context } from 'application'
import { send } from 'senders'
import router from './router'

// const middle = () => {
//     throw new Error('test')
// }

const handleNotFound = (ctx: Context) => send(ctx, 404)
const app = createApp(router, handleNotFound)
http
    .createServer(app)
    .listen(5000)
