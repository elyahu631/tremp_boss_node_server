// trempInterfaces.ts

import { ObjectId } from "mongodb";

export interface UserInTrempUpdateQuery {
  $push: {
    users_in_tremp: {
      user_id: ObjectId;
      is_approved: string;
    }
  };
}

export interface Tremp {
  creator_id: ObjectId;
  users_in_tremp: UserInTremp[];
  [key: string]: any;
}

export interface UserInTremp {
  user_id: ObjectId;
  participants_amount: number;
  is_approved: string;
}  

export interface UsersApprovedInTremp {
  tremp_type: string;
  is_approved: string;
  user_id: ObjectId; 
}  