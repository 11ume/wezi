import { ErrorHandler } from 'wezi-types'
import { createComposer, createComposerMain } from './composer'
import * as handlers from './handlers'

export const composer = (errorHandler: ErrorHandler = handlers.errorHandler) => createComposer(errorHandler, handlers.executeHandler)
export const composerMain = (errorHandler: ErrorHandler = handlers.errorHandler) => createComposerMain(handlers.endHandler, errorHandler, handlers.executeHandler)
