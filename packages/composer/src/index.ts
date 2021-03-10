import { ErrorHandler } from 'wezi-types'
import { createComposer } from './composer'
import * as handlers from './handlers'

export const composer = (errorHandler?: ErrorHandler) => {
    const errHandler = errorHandler ?? handlers.errorHandler
    return createComposer(handlers.endHandler, errHandler, handlers.executeHandler)
}
