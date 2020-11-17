import { ContextRoute } from 'wezi-router'
import { send } from 'wezi-send'
import Bear from 'bear'
import * as repository from 'api/bears/repository'

export const getAll = () => repository.getAll()

export const getById = ({ params }: ContextRoute<Pick<Bear, 'id'>>) => {
    const bear = repository.getById(params.id)
    if (bear) return bear
    return null
}

export const create = (c: ContextRoute, bear: Bear) => {
    repository.create(bear)
    send(c, 200, {
        meesage: 'created'
    })
}

export const update = (c: ContextRoute, bear: Bear) => {
    if (repository.update(bear)) return send(c, 200)
    return send(c, 404, {
        message: 'resource not found'
    })
}

export const remove = (c: ContextRoute<Pick<Bear, 'id'>>) => {
    if (repository.remove(c.params.id)) return send(c, 200)
    return send(c, 404, {
        message: 'resource not found'
    })
}
