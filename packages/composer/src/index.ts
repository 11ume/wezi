import { ErrorHandler, Handler } from 'wezi-types'
import { createComposer, createComposerMain } from './composer'
import { endHandler, errorHandler, executeHandler } from './handlers'

export const composer = (errHandler: ErrorHandler = errorHandler) => (...handlers: Handler[]) => createComposer(errHandler, executeHandler, handlers)
export const composerMain = (errHandler: ErrorHandler = errorHandler, ...handlers: Handler[]) => createComposerMain(endHandler, errHandler, executeHandler, handlers)
