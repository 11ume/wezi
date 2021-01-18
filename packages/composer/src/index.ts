import { endHandler, errorHandler, executeHandler } from './handlers/lazy'
import { createComposer, createComposerSingle } from './composer'

export const composer = createComposer(endHandler, errorHandler, executeHandler)
export const composerSingle = createComposerSingle(errorHandler, executeHandler)
