import { createRouter } from 'wezi-router'
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
    }
}

const { wezi, router } = create()

export {
    create
    , wezi
    , router
}
