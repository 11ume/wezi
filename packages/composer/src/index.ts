import { createComposer } from './composer'
import { executeHandlerLazy } from './composer/executors'
import { defaultEndHandler } from './composer/handlers'

export const $composer = Symbol('composer')
export const lazyComposer = createComposer(null, defaultEndHandler, executeHandlerLazy)
