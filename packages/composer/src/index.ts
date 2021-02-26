import { createComposer } from './composer'
import { endHandler, executeHandlerLazy } from './composer/handlers'

export const $composer = Symbol('composer')
export const lazyComposer = createComposer(null, endHandler, executeHandlerLazy)
