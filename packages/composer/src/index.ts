import { executeHandlerLazy } from './handlers/lazy'
import { executeNoLazy } from './handlers/noLazy'
import { endHandler, errorHandler } from './handlers/common'
import { createComposer } from './composer'

export const $composer = Symbol('composer')
export const lazyComposer = createComposer(endHandler, errorHandler, executeHandlerLazy)
export const noLazyComposer = createComposer(endHandler, errorHandler, executeNoLazy)

