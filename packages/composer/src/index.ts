import { create, createSigle } from './create'
import { endHandler, errorHandler, executeHandler } from './composers/resolver'

// auto resolver composers
const resolver = create(endHandler, errorHandler, executeHandler)
const resolverSingle = createSigle(errorHandler, executeHandler)

export const composer = resolver
export const composerSingle = resolverSingle
