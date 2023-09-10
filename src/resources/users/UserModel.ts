// src/resources/users/UserModel.ts

import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { UserInterface } from './UserInterface';
import { getCurrentTimeInIsrael } from '../../services/TimeService';

class UserModel {
  email?: string;
  password?: string;
  coins?: number;
  createdAt?: Date;
  updatedAt?: Date;
  phone_number?: string;
  image_URL?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  groups?: ObjectId[];
  last_login_date?: Date;
  notification_token?: string;
  status?: string;
  deleted?: boolean;
  isVerified ?: boolean;   
  verificationToken ?: string; 

  constructor(userData: Partial<UserModel>) {
    this.email = userData.email;
    this.password = userData.password;
    this.phone_number = userData.phone_number;
    this.image_URL = userData.image_URL;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.gender = userData.gender;
    this.coins = userData.coins || 0;
    this.createdAt = userData.createdAt || getCurrentTimeInIsrael();
    this.updatedAt = userData.updatedAt || getCurrentTimeInIsrael();
    this.last_login_date = userData.last_login_date;
    this.groups = userData.groups || [];
    this.notification_token = userData.notification_token || "";
    this.status = userData.status || "active";
    this.deleted = userData.deleted || false;
    this.isVerified = userData.isVerified || false;   
    this.verificationToken = userData.verificationToken || ""; 
  }

  validateUser() {
    const schema = Joi.object({
      email: Joi.string().email().max(50).required(),
      password: Joi.string().min(8).required(),
    });

    // Only validate the email and password properties
    const { error } = schema.validate({
      email: this.email,
      password: this.password,
    });

    if (error) {
      throw new Error(error.details[0].message);
    }
  }

  static fromUserDocument(userDocument: UserInterface): UserModel {
    return new UserModel(userDocument);
  }

  isProfileComplete(): boolean {
    return (
      !!this.email &&
      !!this.password &&
      !!this.phone_number &&
      !!this.image_URL &&
      !!this.first_name &&
      !!this.last_name &&
      !!this.gender
    );
  }

}
export default UserModel;
