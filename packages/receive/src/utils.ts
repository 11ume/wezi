import { createError } from 'wezi-error'

export const parseJSON = <T>(str: string): T => {
    try {
        return JSON.parse(str)
    } catch (err) {
        throw createError(400, 'Invalid JSON', err)
    }
}
