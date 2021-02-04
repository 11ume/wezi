import { createComposer } from './composer'
import { executeHandlerLazy, executeNoLazy } from './composers'
import { endHandler, errorHandler } from './composers/handlers'

export const $composer = Symbol('composer')
export const noLazyComposer = createComposer(endHandler, errorHandler, executeNoLazy)
export const lazyComposer = createComposer(endHandler, errorHandler, executeHandlerLazy)

