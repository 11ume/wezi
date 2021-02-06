import { ErrorHandler } from 'wezi-types'
import { ComposerCreator, createComposer } from './composer'
import { executeHandlerLazy } from './composer/executors'
import { errorHandler, endHandler } from './composer/handlers'

export const $composer = Symbol('composer')
export const lazyComposer: ComposerCreator = (errHandler: ErrorHandler = errorHandler) => createComposer(errHandler, endHandler, executeHandlerLazy)
