import { App } from '../index'

const app = new App()
// app.use((_req, res) => {
//     res.statusCode = 300
// })
app.use('/app', () => 'foo')
app.listen(5000, () => console.log('listen'))
