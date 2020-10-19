import http from 'http'
import app from './app'

const port = 5000
http
    .createServer(app)
    .listen(port, () => `service listen in port ${port}`)
