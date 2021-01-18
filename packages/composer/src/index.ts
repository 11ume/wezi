import { endHandler, errorHandler, executeHandler } from 'wezi-lazy-handlers'
import { create, createSigle } from './composer'

export const composer = create(endHandler, errorHandler, executeHandler)
export const composerSingle = createSigle(errorHandler, executeHandler)
