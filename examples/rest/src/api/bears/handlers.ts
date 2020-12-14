import { ContextRoute } from 'wezi-router'
import Bear, { BearId } from 'bear'
import * as repository from 'api/bears/repository'

export const getAll = () => repository.getAll()

export const getById = ({ params }: ContextRoute<BearId>) => {
    const bear = repository.getById(params.id)
    if (bear) return bear
    return null
}

export const create = ({ send }: ContextRoute, bear: Bear) => {
    repository.create(bear)
    send.json(200, {
        meesage: 'created'
    })
}

export const update = ({ send }: ContextRoute, bear: Bear) => {
    if (repository.update(bear)) return send.ok()
    return send.json(404, {
        message: 'resource not found'
    })
}

export const remove = ({ send, params }: ContextRoute<BearId>) => {
    if (repository.remove(params.id)) return send.ok()
    return send.json(404, {
        message: 'resource not found'
    })
}
