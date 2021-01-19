import { create } from './src'
export { listen } from './src/wezi'
export { Context, Handler } from 'wezi-types'
export {
    get
    , post
    , put
    , del
    , head
    , patch
    , options
} from 'wezi-router'

const { wezi, router, routerSpace } = create()

export {
    router
    , routerSpace
}

export default wezi
