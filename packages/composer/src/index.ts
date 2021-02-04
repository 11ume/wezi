import { createComposer } from './composer'
import { executeHandlerLazy, executeHandlerNoLazy } from './composer/execute'
import { endHandler, errorHandler } from './composer/handlers'

export const $composer = Symbol('composer')
export const noLazyComposer = createComposer(endHandler, errorHandler, executeHandlerNoLazy)
export const lazyComposer = createComposer(endHandler, errorHandler, executeHandlerLazy)

