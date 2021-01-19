import { createRouter, createRouterSpace } from 'wezi-router'
import { lazyComposer, lazyComposerSingle, Composer, ComposerSingle } from 'wezi-composer'
import { createWezi } from './wezi'

export const create = (composer: Composer = lazyComposer, composerSingle: ComposerSingle = lazyComposerSingle) => {
    return {
        wezi: createWezi(composer)
        , router: createRouter(composer, composerSingle)
        , routerSpace: createRouterSpace(composer, composerSingle)
    }
}
