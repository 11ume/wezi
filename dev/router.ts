import { ContextRoute, whitNamespace, get, post, put } from 'router'
import { json } from 'recibers'

type UserBody = {
    name: string
}

type UserByIdParams = {
    id: string
}

const getAll = () => [1, 2, 3]
const getById = (ctx: ContextRoute<UserByIdParams>) => ctx.params.id
const create = async (ctx: ContextRoute) => json<UserBody>(ctx)
const update = async (ctx: ContextRoute) => json<UserBody>(ctx)

const router = (namespace: string) => whitNamespace(namespace)(
    get('/users', getAll)
    , get('/users/:id', getById)
    , post('/users', create)
    , put('/users', update)
)

export default router
