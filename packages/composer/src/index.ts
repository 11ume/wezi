import { createComposer } from './composer'
import { executeHandlerLazy } from './composer/executors'
import { errorHandler, endHandler } from './composer/handlers'

export const $composer = Symbol('composer')
export const lazyComposer = createComposer(errorHandler, endHandler, executeHandlerLazy)
