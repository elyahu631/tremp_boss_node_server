// src/resources/tremps/TrempModel.ts

import Joi from "joi";
import { ObjectId } from "mongodb";
import { getCurrentTimeInIsrael } from "../../utils/TimeService";
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface UserInTremp {
  user_id: ObjectId;
  is_approved: string;
}

class TrempModel {
  creator_id: ObjectId; //from client 
  group_id: ObjectId;// from client chack if group active and exsits 
  tremp_type: string;
  create_date: string;// 
  tremp_time: string;// client 
  from_root: {    // chack if form an to is no simmular
    name: string;
    coordinates: Coordinate;
  };
  to_root: {
    name: string;
    coordinates: Coordinate;
  };
  note: string;
  seats_amount: number;
  users_in_tremp: UserInTremp[];
  is_full: boolean;
  chat_id: ObjectId;// server
  active: boolean;
  deleted: boolean;

  constructor(trempData: Partial<TrempModel>) {
    this.creator_id = trempData.creator_id;
    this.group_id = trempData.group_id;
    this.tremp_type = trempData.tremp_type;
    this.create_date = trempData.create_date || getCurrentTimeInIsrael();
    this.tremp_time = trempData.tremp_time;
    this.from_root = trempData.from_root;
    this.to_root = trempData.to_root;
    this.note = trempData.note;
    this.seats_amount = trempData.seats_amount || 1;
    this.users_in_tremp = trempData.users_in_tremp || [];
    this.is_full = trempData.is_full || false;
    this.chat_id = trempData.chat_id ;
    this.active = trempData.active || true;
    this.deleted = trempData.deleted || false;
  }

  validateTremp() {
    const schema = Joi.object({
      creator_id: Joi.string().required(),
      group_id: Joi.string().required(),//need to create a model for it 
      tremp_type: Joi.string().valid('driver', 'hitchhiker').required(),
      create_date: Joi.string().required(),
      tremp_time: Joi.string().required(),
      from_root: Joi.object({
        name: Joi.string().required(),
        coordinates: Joi.object({
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
        }).required(),
      }).required(),
      to_root: Joi.object({
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
          is_approved: Joi.string().valid('approved', 'pending', 'denied').default('pending').required(),
        })
      ).optional(),
      is_full: Joi.boolean().required(),
      chat_id: Joi.string().optional(),// need to create a model for it 
      active: Joi.boolean().required(),
      deleted: Joi.boolean().required(),
    });
    const { error } = schema.validate(this);
    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
export default TrempModel;
