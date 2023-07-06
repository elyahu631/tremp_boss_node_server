// src/resources/adminUsers/AdminModel.ts

import Joi from "joi";
import { getCurrentTimeInIsrael } from "../../utils/TimeService";

class AdminModel {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  phone_number?: string;
  photo_URL?: string;
  account_activated: boolean;
  last_login_date?: string;
  deleted?: boolean;

  constructor(adminData: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    password?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
    phone_number?: string;
    photo_URL?: string;
    last_login_date?: string;
    account_activated?: boolean;
    deleted?: boolean;
  }) {
    this.email = adminData.email;
    this.username = adminData.username;
    this.first_name = adminData.first_name;
    this.last_name = adminData.last_name;
    this.password = adminData.password;
    this.role = adminData.role;
    this.phone_number = adminData.phone_number;
    this.photo_URL = adminData.photo_URL;
    this.account_activated = adminData.account_activated;
    this.createdAt = adminData.createdAt || getCurrentTimeInIsrael();
    this.updatedAt = adminData.updatedAt || getCurrentTimeInIsrael();
    this.last_login_date = adminData.last_login_date;
    this.deleted = adminData.deleted || false;
  }

  validateNewAdmin() {
    const schema = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      phone_number: Joi.string().required(),
      password: Joi.string().min(8).required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      role: Joi.string().required(),
      account_activated: Joi.boolean().required(),
      photo_URL: Joi.string().optional(),
      createdAt: Joi.string().isoDate().required(),
      updatedAt: Joi.string().isoDate().required(),
      last_login_date: Joi.string().isoDate().allow(null),
      deleted: Joi.boolean().required()
    });

    const { error } = schema.validate(this);

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
export default AdminModel;
