import { create, createSigle } from './create'
import { endHandler, errorHandler, executeHandler } from './composers/common'

const common = create(endHandler, errorHandler, executeHandler)
const commonSigle = createSigle(errorHandler, executeHandler)

export const composer = common
export const composerSingle = commonSigle
