import { Bear } from './bear'

let bears = [
    {
        id: '1'
        , type: 'Polar'
        , location: 'North Pole'
    }
    , {
        id: '2'
        , type: 'Grizzly'
        , location: 'Yellowstone National Park'
    }
]

export const getAll = (): Bear[] => bears
export const getById = (id: string): Bear => bears.find((bear) => bear.id === id)
export const create = (bear: Bear): boolean => {
    bears.push(bear)
    return true
}
export const update = (bear: Bear) => {
    const index = bears.findIndex((b) => b.id === bear.id)
    if (index) {
        bears[index] = bear
        return true
    }
    return false
}
export const remove = (id: string) => {
    const found = bears.filter((bear) => bear.id !== id)
    if (found) {
        bears = bears.filter((bear) => bear.id !== id)
        return true
    }
    return false
}
