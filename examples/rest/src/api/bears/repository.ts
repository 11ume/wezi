import Bear from 'bear'
import bears from 'store'
import { createId } from 'utils'

export const getAll = () => Array.from(bears.values())

export const getById = (id: string) => {
    const found = bears.get(id)
    if (found) return found
    return false
}

export const create = (bear: Bear) => {
    const id = createId().toString()
    const newBear = Object.assign({}, bear)
    newBear.id = id
    bears.set(id, newBear)
}

export const update = (bear: Bear) => {
    const found = bears.get(bear.id)
    if (found) {
        bears.set(bear.id, bear)
        return true
    }
    return false
}

export const remove = (id: string) => {
    const found = bears.get(id)
    if (found) {
        bears.delete(id)
        return true
    }
    return false
}
