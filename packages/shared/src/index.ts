import { ErrorHandler } from 'wezi-types'

type Shareable = {
    errorHandler: ErrorHandler
}

export const shareable: Shareable = {
    errorHandler: null
}
