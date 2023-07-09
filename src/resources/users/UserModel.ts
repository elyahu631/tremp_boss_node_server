// src/resources/users/UserModel.ts

import Joi from 'joi';
import { ObjectId } from 'mongodb';

class UserModel {
  user_email?: string;
  password?: string;
  coins?: number;
  createdAt?: string;
  updatedAt?: string;
  phone_number?: string;
  photo_URL?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  groups?: ObjectId[];
  last_login_date?: string;
  status?: string;
  deleted ?: boolean;

  constructor(userData: {
    user_email?: string;
    password?: string;
    phone_number?: string;
    photo_URL?: string;
    first_name?: string;
    last_name?: string;
    gender?: string;
    coins?: number;
    createdAt?: string;
    updatedAt?: string;
    last_login_date?: string;
    groups?: ObjectId[];
    status?: string;
    deleted ?: boolean;
  }) {
    this.user_email = userData.user_email;
    this.password = userData.password;
    this.phone_number = userData.phone_number;
    this.photo_URL = userData.photo_URL;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.gender = userData.gender;
    this.coins = userData.coins || 0; 
    this.createdAt = userData.createdAt || new Date().toISOString(); 
    this.updatedAt = userData.updatedAt || new Date().toISOString(); 
    this.last_login_date = userData.last_login_date; 
    this.groups = userData.groups || [new ObjectId("64743b14b165e7102c90dd32")];
    this.status = userData.status || "active"; 
    this.deleted = userData.deleted || false; 
  }

  validateUser() {
    const schema = Joi.object({
      user_email: Joi.string().email().max(50).required(),
      password: Joi.string().min(8).required(),
    });
  
    // Only validate the user_email and password properties
    const { error } = schema.validate({
      user_email: this.user_email,
      password: this.password,
    });
  
    if (error) {
      throw new Error(error.details[0].message);
    }
  }
  
}
export default UserModel;
