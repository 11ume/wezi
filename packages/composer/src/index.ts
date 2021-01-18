import { create, createSigle } from './composer'
import { endHandler, errorHandler, executeHandler } from 'wezi-lazy-handlers'

export const composer = create(endHandler, errorHandler, executeHandler)
export const composerSingle = createSigle(errorHandler, executeHandler)
