import router, { ContextRouter, get } from 'router'

type Params = {
    id: string
}

const getUserById = get('/user/:id', (ctx: ContextRouter<Params>) => ctx.params.id)
const getAll = get('/user', () => [
    {
        name: 'foo'
    }
])

const r = router(
    getUserById
    , getAll
)

export default r
