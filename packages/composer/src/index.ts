import { createComposer } from './composer'
import { defaultEndHandler, executeHandler, executeHandlerLazy } from './composer/handlers'

export const $composer = Symbol('composer')
export const noLazyComposer = createComposer(null, defaultEndHandler, executeHandler)
export const lazyComposer = createComposer(null, defaultEndHandler, executeHandlerLazy)
