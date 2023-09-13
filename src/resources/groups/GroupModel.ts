import Joi from "joi";
import { ObjectId } from 'mongodb';

class GroupModel {
  _id: ObjectId;
  group_name: string;
  description?: string; 
  type: string;
  image_URL: string;
  locations: Array<{ name: string; coordinates: { latitude: number; longitude: number; } }>;
  admins_ids: ObjectId[];
  active: string;
  deleted: boolean;

  constructor(groupData: Partial<GroupModel>) {
    this._id = groupData._id || new ObjectId();
    this.group_name = groupData.group_name;
    this.description = groupData.description;
    this.type = groupData.type || 'PRIVATE';
    this.image_URL = groupData.image_URL;
    this.locations = groupData.locations;
    this.admins_ids = groupData.admins_ids || [];
    this.active = groupData.active || 'active';
    this.deleted = groupData.deleted || false;
  }

  validateGroup() {
    const schema = Joi.object({
      _id: Joi.any().optional(),
      group_name: Joi.string().required(),
      description: Joi.string().allow('').max(500).optional(),
      type: Joi.string()
        .required()
        .valid('GENERAL', 'PRIVATE'),
      image_URL: Joi.string().allow('').optional(),
      locations: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        coordinates: Joi.object({
          latitude: Joi.number()
            .required()
            .min(-90)
            .max(90),
          longitude: Joi.number()
            .required()
            .min(-180)
            .max(180),
        }).required(),
      })).required(),
      admins_ids: Joi.array().items(Joi.any()).optional(),
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
