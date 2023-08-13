// resources/users/UserValidation.ts
import Joi from 'joi';
import UserModel from './UserModel';

export function validateUpdatedUser(updatedUser: UserModel) : boolean{
  console.log(updatedUser);

  const schema = Joi.object({
    email: Joi.string().email().optional(),
    phone_number: Joi.string().optional(),
    password: Joi.string().min(6).optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    gender: Joi.string().valid('M', 'F').optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    deleted: Joi.boolean().optional(),
    notification_token: Joi.string().optional(),
  });
  const { error } = schema.validate(updatedUser);
  if (error) {
    return false;
  }
  return true;
}
