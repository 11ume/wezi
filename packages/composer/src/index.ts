import { createComposer } from './composer'
import { defaultEndHandler, executeHandlerLazy } from './composer/handlers'

export const $composer = Symbol('composer')
export const lazyComposer = createComposer(null, defaultEndHandler, executeHandlerLazy)
