import { ErrorHandler } from 'wezi-types'
import { createComposer } from './composer'
import * as handlers from './handlers'

export const composer = (errorHandler: ErrorHandler = handlers.errorHandler) => createComposer(handlers.endHandler, errorHandler, handlers.executeHandler)
