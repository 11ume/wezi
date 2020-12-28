
import { Context } from 'wezi-types'

export const createContext = <T>(context: Context, obj: T) => Object.assign(context, obj)
export const isWritableEnded = (context: Context) => context.res.writableEnded
