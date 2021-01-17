import { Handler } from 'wezi-types'
import {
    Composer
    , composerProd
    , ComposerSingle
    , composerSingleProd
} from './composer'

export const composerDev: Composer = (main: boolean, handlers: Handler[]) => {
    return composerProd(main, handlers)
}

export const composerSingleDev: ComposerSingle = (handler: Handler) => {
    return composerSingleProd(handler)
}
