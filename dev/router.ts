import { ContextRoute, whitNamespace, get, put } from 'router'
import { json } from 'recibers'
import { Context } from 'vm'

type UserBody = {
    name: string
}

type UserByIdParams = {
    id: string
}

const getAll = () => [1, 2, 3]
const getById = (ctx: ContextRoute<UserByIdParams>) => ctx.params.id
// const create = async (ctx: ContextRoute) => json<UserBody>(ctx)
const update = async (ctx: ContextRoute) => json<UserBody>(ctx)
const other = (ctx: Context) => {
    const { id, foo } = ctx.params
    return {
        id
        , foo
    }
}

const router = (namespace: string) => whitNamespace(namespace)(
    get('/users', getAll)
    , get('/users/:id', getById)
    , get('/users/:id/:foo', other)
    , put('/users', update)
)

export default router
