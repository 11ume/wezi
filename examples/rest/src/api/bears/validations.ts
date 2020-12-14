import Joi from 'joi'
import Bear, { BearId } from 'bear'
import { ContextRoute } from 'wezi-router'

const bearSchemaId = Joi.string().max(3).min(0).required()
const bearSchema = Joi.object({
    id: Joi.string().max(3).min(0).optional()
    , type: Joi.string().max(100).min(0).required()
    , location: Joi.string().max(100).min(0).required()
})

export const validateId = ({ next, panic, params }: ContextRoute<BearId>) => {
    const valid = bearSchemaId.validate(params.id)
    if (valid.error) {
        panic(valid.error)
        return
    }

    next()
}

export const validate = async ({ next, panic, receive }: ContextRoute<Bear>) => {
    const bear = await receive.json<Bear>()
    const valid = bearSchema.validate(bear)
    if (valid.error) {
        panic(valid.error)
        return
    }

    next(bear)
}
