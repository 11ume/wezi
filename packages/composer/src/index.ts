import { composerProd, composerSingleProd } from './composer'
import { composerDev, composerSingleDev } from './composer-dev'
import { isProduction } from './utils'

const isProd = isProduction()
export const composer = isProd ? composerProd : composerDev
export const composerSingle = isProd ? composerSingleProd : composerSingleDev
