import { createComposer } from './composer'
import { executeNoLazy } from './handlers/noLazy'
import { executeHandlerLazy } from './handlers/lazy'
import { endHandler, errorHandler } from './handlers/common'

export const $composer = Symbol('composer')
export const lazyComposer = createComposer(endHandler, errorHandler, executeHandlerLazy)
export const noLazyComposer = createComposer(endHandler, errorHandler, executeNoLazy)

