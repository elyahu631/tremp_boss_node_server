import Joi from "joi";
import { ObjectId } from 'mongodb';

class GroupModel {
  _id: ObjectId;
  group_name: string;
  type: string;
  image_URL: string;
  locations: Array<{ name: string; coordinates: { latitude: number; longitude: number; }; }>;
  active: string;
  deleted: boolean;

  constructor(groupData: any) {
    this._id = groupData._id || new ObjectId();
    this.group_name = groupData.group_name;
    this.type = groupData.type;
    this.image_URL = groupData.image_URL;
    this.locations = groupData.locations;
    this.active = groupData.active||"active";
    this.deleted = groupData.deleted || false;
  }

  validateGroup() {
    const schema = Joi.object({
      _id: Joi.optional(),
      group_name: Joi.string().required(),
      type: Joi.string().required(),
      image_URL: Joi.string().optional(),
      locations: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        coordinates: Joi.object({
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
        }).required(),
      })).required(),
      active: Joi.string().required(),
      deleted: Joi.boolean().required(),
    });

    const { error } = schema.validate(this);

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}

export default GroupModel;
