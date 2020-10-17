// import morgan from 'morgan'
import { App } from 'application'

const app = new App()
app.use((_req, res) => {
    res.statusCode = 300
})
app.use('/app', () => 'foo')
app.listen(5000)
