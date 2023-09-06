import Joi from 'joi';
import { BadRequestException } from '../../middleware/HttpException';

const timePattern = Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required();
const sixDaysAgo = new Date();
sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

export const trempSchema = Joi.object({
  creator_id: Joi.string().required(),
  group_id: Joi.string().required(),
  tremp_type: Joi.string().required(),
  dates: Joi.object().pattern(
    Joi.string(),
    Joi.date().min(sixDaysAgo).iso().required()
  ).required(),
  hour: timePattern,
  from_route: Joi.object({
    name: Joi.string().required(),
    coordinates: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).required(),
  }).required(),
  to_route: Joi.object().required().keys({
    name: Joi.string().required(),
    coordinates: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).required(),
  }),
  seats_amount: Joi.number().required(),
  note: Joi.string().optional(),
  is_permanent: Joi.boolean().required(),
  return_hour: timePattern.optional(),
});

export function validateTrempRequest(data: any) {
  const { error } = trempSchema.validate(data);
  if (error) {
    throw new BadRequestException(error.message);
  }
}
