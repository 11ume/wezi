
import { Context } from 'wezi-types'

export const isPromise = (obj: any) => obj && typeof obj.then === 'function'
export const isProduction = () => process.env.NODE_ENV === 'production'
export const createContext = <T>(context: Context, obj: T) => Object.assign(context, obj)
