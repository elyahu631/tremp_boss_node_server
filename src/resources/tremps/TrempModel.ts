// src/resources/tremps/TrempModel.ts

import Joi from "joi";
import { ObjectId } from "mongodb";
import { getCurrentTimeInIsrael } from "../../services/TimeService";
import { UserInTremp } from "./TrempInterfaces";

interface Coordinate {
  latitude: number;
  longitude: number;
}

class TrempModel {
  creator_id: ObjectId;
  group_id: ObjectId; 
  tremp_type: string; 
  create_date: Date; 
  tremp_time: Date; 
  from_route: {    
    name: string;
    coordinates: Coordinate;
  };
  to_route: {
    name: string;
    coordinates: Coordinate;
  };
  note?: string;
  seats_amount: number;
  users_in_tremp: UserInTremp[];
  is_full: boolean;
  chat_id: ObjectId;
  is_completed: boolean;
  deleted: boolean;

  constructor(trempData: Partial<TrempModel>) {
    this.creator_id = trempData.creator_id;
    this.group_id = trempData.group_id;
    this.tremp_type = trempData.tremp_type;
    this.create_date = trempData.create_date || getCurrentTimeInIsrael();
    this.tremp_time = trempData.tremp_time;
    this.from_route = trempData.from_route;
    this.to_route = trempData.to_route;
    this.note = trempData.note;
    this.seats_amount = trempData.seats_amount || 1;
    this.users_in_tremp = trempData.users_in_tremp || [];
    this.is_full = trempData.is_full || false;
    this.chat_id = trempData.chat_id ;
    this.is_completed = trempData.is_completed || false; 
    this.deleted = trempData.deleted || false;
  }

  validateTremp() {
    const schema = Joi.object({
      creator_id: Joi.any().required(),
      group_id: Joi.any().required(),
      tremp_type: Joi.string().valid('driver', 'hitchhiker').required(),
      create_date: Joi.date().required(),
      tremp_time: Joi.date().required(),
      from_route: Joi.object({
        name: Joi.string().required(),
        coordinates: Joi.object({
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
        }).required(),
      }).required(),
      to_route: Joi.object({
        name: Joi.string().required(),
        coordinates: Joi.object({
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
        }).required(),
      }).required(),
      note: Joi.string().optional(),
      seats_amount: Joi.number().integer().min(1).required(),
      users_in_tremp: Joi.array().items(
        Joi.object({
          user_id: Joi.string().required(),
          participants_amount: Joi.number().default(1),
          is_approved: Joi.string().valid('approved', 'pending', 'denied','canceled' ).default('pending').required(),
        })
      ).optional(),
      is_full: Joi.boolean().required(),
      chat_id: Joi.string().optional(),
      is_completed: Joi.boolean().required(),
      deleted: Joi.boolean().required(),
    });
    const { error } = schema.validate(this);
    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
export default TrempModel;
