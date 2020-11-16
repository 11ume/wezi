import {
    routes
    , get
    , post
    , put
    , del
} from 'wezi-router'
import {
    getAll
    , getById
    , create
    , update
    , remove
} from './handlers'

const r = routes()
export default r(
    get('/bears', getAll)
    , get('/bears/:id', getById)
    , post('/bears', create)
    , put('/bears', update)
    , del('/bears/:id', remove)
)
