import router, { ContextRoute, get, post, put } from 'router'
import { json } from 'recibers'
import { NextFunction } from 'application'
import { createError } from 'error'
// import { users } from './store'

type UserBody = {
    name: string
}

type UserByIdParams = {
    id: string
}

const getAll = (_, next: NextFunction) => {
    next(createError(400, 'bad request'))
}
const getById = (ctx: ContextRoute<UserByIdParams>) => ctx.params.id
const create = async (ctx: ContextRoute) => json<UserBody>(ctx)
const update = async (ctx: ContextRoute) => json<UserBody>(ctx)

const r = router(
    get('/users', getAll)
    , get('/users/:id', getById)
    , post('/users', create)
    , put('/users', update)
)

export default r
