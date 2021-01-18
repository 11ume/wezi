import { executeHandlerLazy } from './handlers/lazy'
import { endHandler, errorHandler } from './handlers/common'
import { createComposer, createComposerSingle } from './composer'

const lazyComposer = createComposer(endHandler, errorHandler, executeHandlerLazy)
const lazyComposerSingle = createComposerSingle(errorHandler, executeHandlerLazy)

export const composer = lazyComposer
export const composerSingle = lazyComposerSingle
