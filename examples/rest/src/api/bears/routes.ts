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
} from 'api/bears/handlers'
import { validate, validateId } from 'api/bears/validations'

const r = routes()
export default r(
    get('/bears', getAll)
    , get('/bears/:id', validateId, getById)
    , post('/bears', validate, create)
    , put('/bears', validate, update)
    , del('/bears/:id', validateId, remove)
)
