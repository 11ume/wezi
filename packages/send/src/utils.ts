import { Context } from 'wezi-types'

export const noContentType = (context: Context) => !context.res.getHeader('Content-Type')

export const isEmpty = (obj) => obj === null || obj === undefined

