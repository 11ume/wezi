import {
    composer
    , composerSingle
    , EndHandler
    , ErrorHandler
    , ExecuteHandler
} from './composer'

export const create = (endHandler: EndHandler, errorHandler: ErrorHandler, executeHandler: ExecuteHandler) => {
    return composer(endHandler, errorHandler, executeHandler)
}

export const createSigle = (errorHandler: ErrorHandler, executeHandler: ExecuteHandler) => {
    return composerSingle(errorHandler, executeHandler)
}
