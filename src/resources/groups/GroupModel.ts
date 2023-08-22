import Joi from "joi";
import { ObjectId } from 'mongodb';

class GroupModel {
  _id: ObjectId;
  group_name: string;
  type: string;
  image_URL: string;
  location: Array<{ latitude: number; longitude: number; }>;
  active: string;
  admins_ids: ObjectId[];
  deleted: boolean;

  constructor(groupData:  Partial<GroupModel>) {
    this._id = groupData._id || new ObjectId();
    this.group_name = groupData.group_name;
    this.type = groupData.type;
    this.image_URL = groupData.image_URL;
    this.location = groupData.location;
    this.active = groupData.active || 'active';
    this.admins_ids = groupData.admins_ids || [];
    this.deleted = groupData.deleted || false;
  }
  
  validateGroup() {
    const schema = Joi.object({
      _id: Joi.any().optional(),
      group_name: Joi.string().required(),
      type: Joi.string()
        .required()
        .valid('CITIES', 'PRIVATE'),
      image_URL: Joi.string().optional(),
      location: Joi.array().items(Joi.object({
        latitude: Joi.number()
          .required()
          .min(-90)
          .max(90),
        longitude: Joi.number()
          .required()
          .min(-180)
          .max(180),
      })).required(),
      active: Joi.string()
        .required()
        .valid('active', 'inactive'),
      admins_ids: Joi.array().items(Joi.string()).optional(),
      deleted: Joi.boolean().required(),
    });

    const { error } = schema.validate(this);
    
    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}

export default GroupModel;
