import router, { ContextRouter, get } from 'router'
import { NextFunction } from 'application'

type Params = {
    id: string
}

const getUserById = get('/user/:id', (_ctx: ContextRouter<Params>, next: NextFunction) => {
    // ctx.params.id
    next()
})

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
