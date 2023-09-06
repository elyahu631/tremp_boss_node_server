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

export interface TrempRequest {
  creator_id: string;
  group_id: string;
  tremp_type: string;
  dates: {
    sun?: string;
    mon?: string;
    tue?: string;
    wed?: string;
    thu?: string;
    fri?: string;
    sat?: string;
  };
  hour: string;
  from_route: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  to_route: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  seats_amount: number;
  note?: string;
  is_permanent: boolean;
  return_hour?: string;
}


export interface Route {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}


