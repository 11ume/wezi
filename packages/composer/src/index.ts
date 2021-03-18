import { ErrorHandler } from 'wezi-types'
import { createComposer, createComposerMain } from './composer'
import { endHandler, errorHandler, executeHandler } from './handlers'

export const composer = (errHandler: ErrorHandler = errorHandler) => createComposer(errHandler, executeHandler)
export const composerMain = (errHandler: ErrorHandler = errorHandler) => createComposerMain(endHandler, errHandler, executeHandler)
