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

