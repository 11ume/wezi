import { create, createSigle } from './create'
import { isProduction } from './utils'
import { endHandler, errorHandler, executeHandler } from './common'

const isProd = isProduction()
const common = create(endHandler, errorHandler, executeHandler)
const commonSigle = createSigle(errorHandler, executeHandler)

export const composer = isProd ? common : common
export const composerSingle = isProd ? commonSigle : commonSigle
