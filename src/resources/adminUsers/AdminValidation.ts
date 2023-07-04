
// src/resources/adminUsers/AdminValidation.ts

import Joi from 'joi';
import AdminModel from './AdminModel';

export function validateAdminUpdates(updateAdminUserDetails: AdminModel) : boolean{

    const schema = Joi.object({
      username: Joi.string(),
      email: Joi.string().email(),
      phone_number: Joi.string(),
      first_name: Joi.string(),
      last_name: Joi.string(),
      role: Joi.string(),
      photo_URL: Joi.string(),
      last_login_date: Joi.string().isoDate().allow(null),
      deleted: Joi.boolean(),
      password: Joi.string().min(8),
      account_activated: Joi.boolean(),
      updatedAt:Joi.string().isoDate().allow(null),
    });
    const { error } = schema.validate(updateAdminUserDetails);
    if (error) {
      console.log('====================================');
      console.log(error.details[0].message);
      console.log('====================================');
      return false;
    }
    return true;
}
