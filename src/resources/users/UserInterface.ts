import { ObjectId } from 'mongodb';

export interface UserInterface  {
  _id?: ObjectId;
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
  notification_token ?: string;
}