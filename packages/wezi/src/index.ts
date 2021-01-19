import { createRouter, createRouterSpace } from 'wezi-router'
import { lazyComposer, lazyComposerSingle, Composer, ComposerSingle } from 'wezi-composer'
import { createWezi } from './wezi'

type Create = {
    composer?: Composer
    composerSingle?: ComposerSingle
}

const create = ({ composer = lazyComposer, composerSingle = lazyComposerSingle }: Create = {}) => {
    return {
        wezi: createWezi(composer)
        , router: createRouter(composer, composerSingle)
        , routerSpace: createRouterSpace(composer, composerSingle)
    }
}

const { wezi, router, routerSpace } = create()

export {
    create
    , wezi
    , router
    , routerSpace
}
