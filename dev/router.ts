import router, { ContextRouter, get, post } from 'router'
import { json } from 'recibers'

type Params = {
    id: string
}

type User = {
    name: string
}

const getById = get('/user/:id', (ctx: ContextRouter<Params>) => ctx.params.id)
const create = post('/user', async (ctx: ContextRouter) => {
    const { name } = await json<User>(ctx)
    return name
})
const getAll = get('/user', () => [
    {
        name: 'foo'
    }
])

const usersRouter = router(
    getById
    , create
    , getAll
)

export default usersRouter
