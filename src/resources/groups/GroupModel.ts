import Joi from "joi";
import { ObjectId } from 'mongodb';

class GroupModel {
  _id: ObjectId;
  group_name: string;
  type: string;
  image_URL: string;
  location: Array<{ latitude: number; longitude: number; }>;
  active: string;
  deleted: boolean;

  constructor(groupData: any) {
    this._id = groupData._id || new ObjectId();
    this.group_name = groupData.group_name;
    this.type = groupData.type;
    this.image_URL = groupData.image_URL;
    this.location = groupData.location;
    this.active = groupData.active || 'active';
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
      deleted: Joi.boolean().required(),
    });

    const { error } = schema.validate(this);
    
    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}

export default GroupModel;
