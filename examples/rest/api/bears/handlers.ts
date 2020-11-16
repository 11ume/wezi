import { ContextRoute } from 'wezi-router'
import { json } from 'wezi-receive'
import { send } from 'wezi-send'
import { Bear } from './bear'
import * as repository from './repository'

export const getAll = () => repository.getAll()
export const getById = ({ params }: ContextRoute<Pick<Bear, 'id'>>) => {
    const bear = repository.getById(params.id)
    if (bear) return bear
    return null
}

export const create = async (c: ContextRoute<Bear>) => {
    const bear = await json<Bear>(c)
    if (repository.create(bear)) return send(c, 200)
    return send(c, 400)
}

export const update = async (c: ContextRoute<Bear>) => {
    const bear = await json<Bear>(c)
    if (repository.update(bear)) return send(c, 200)
    return send(c, 400)
}

export const remove = async (c: ContextRoute<Pick<Bear, 'id'>>) => {
    if (repository.remove(c.params.id)) return send(c, 200)
    return send(c, 400)
}
