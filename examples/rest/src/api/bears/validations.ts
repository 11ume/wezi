import Joi from 'joi'
import Bear from 'bear'
import { ContextRoute } from 'wezi-router'
import { json } from 'wezi-receive'

const bearSchemaId = Joi.string().max(3).min(0).required()
const bearSchema = Joi.object({
    id: Joi.string().max(3).min(0).optional()
    , type: Joi.string().max(3).min(0).required()
    , location: Joi.string().max(3).min(0).required()
})

export const validateId = (c: ContextRoute<{ id: string }>) => {
    const valid = bearSchemaId.validate(c.params.id)
    if (valid.error) {
        throw valid.error
    }

    c.next()
}

export const validate = async (c: ContextRoute<Bear>) => {
    const bear = await json<Bear>(c)
    const valid = bearSchema.validate(bear)
    if (valid.error) {
        throw valid.error
    }

    c.next()
}

