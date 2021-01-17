import { create, createSigle } from './create'
import { endHandler, errorHandler, lazyExecteHandler } from './composers/lazy'

// lazy resolver composer
const lazy = create(endHandler, errorHandler, lazyExecteHandler)
const lazySingle = createSigle(errorHandler, lazyExecteHandler)

export const composer = lazy
export const composerSingle = lazySingle
