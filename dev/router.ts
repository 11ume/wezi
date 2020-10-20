import { json } from 'recibers'
import { send } from 'senders'
import router, { get
    , post
    , put
    , del
    , ContextRoute } from 'router'

type User = {
    name: string
    surname: string
}

type UserBodyPartial = Partial<User>

type UserByIdParams = {
    id: string
}

const getAll = (): User[] => [{
    name: 'foo'
    , surname: 'bar'
}]

const getById = (ctx: ContextRoute<UserByIdParams>) => ctx.params.id
const findOne = async (ctx: ContextRoute) => {
    const body = await json<UserBodyPartial>(ctx)
    if (!body.name) {
        send(ctx, 400)
        return
    }

    send(ctx, 200)
}

const create = async (ctx: ContextRoute) => {
    const { name } = await json<User>(ctx)
    return name
}

const update = async (ctx: ContextRoute) => {
    const { name } = await json<UserBodyPartial>(ctx)
    return name
}

const remove = async (ctx: ContextRoute<UserByIdParams>) => ctx.params.id

const r = router(
    get('/users', getAll)
    , get('/users/find', findOne)
    , get('/users/:id', getById)
    , post('/users', create)
    , put('/users', update)
    , del('/users', remove)
)

export default r
