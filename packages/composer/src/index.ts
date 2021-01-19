import { executeHandlerLazy } from './handlers/lazy'
import { endHandler, errorHandler } from './handlers/common'
import { createComposer, createComposerSingle } from './composer'

export const lazyComposer = createComposer(endHandler, errorHandler, executeHandlerLazy)
export const lazyComposerSingle = createComposerSingle(errorHandler, executeHandlerLazy)

