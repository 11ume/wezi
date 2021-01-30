import { executeHandlerLazy } from './handlers/lazy'
import { endHandler, errorHandler } from './handlers/common'
import { createComposer } from './composer'

export const lazy = createComposer(endHandler, errorHandler, executeHandlerLazy)

