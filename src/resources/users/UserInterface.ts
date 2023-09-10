import { ObjectId } from 'mongodb';

export interface UserInterface  {
  _id?: ObjectId;
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
  status?: string;
  deleted ?: boolean;
  notification_token ?: string;
  isVerified?: boolean;
  verificationToken?: string; 
}