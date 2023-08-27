import Joi from "joi";
import { ObjectId } from 'mongodb';
import { getCurrentTimeInIsrael } from "../../services/TimeService";

class GroupRequestModel {
  user_id: ObjectId;
  group_name: string;
  description?: string; 
  type: string;
  image_URL?: string;
  request_date: Date;
  locations: Array<{ name: string; coordinates: { latitude: number; longitude: number; } }>;
  is_approved: String;

  constructor(groupReqData: Partial<GroupRequestModel>) {
    this.user_id = new ObjectId(groupReqData.user_id);
    this.group_name = groupReqData.group_name;
    this.description = groupReqData.description; 
    this.type = groupReqData.type;
    this.image_URL = groupReqData.image_URL;
    this.request_date = groupReqData.request_date || getCurrentTimeInIsrael();
    this.locations = groupReqData.locations;
    this.is_approved = groupReqData.is_approved ||'pending'
  }

  validateGroupRequest() {
    const schema = Joi.object({
      user_id:Joi.required(),
      group_name: Joi.string().required(),
      description: Joi.string().max(500).optional(),
      type: Joi.string()
        .required()
        .valid('PRIVATE'),
      image_URL: Joi.string().optional(),
      request_date: Joi.date().required(),
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
      is_approved: Joi.string().valid('approved', 'pending', 'denied').default('pending'),
    });

    const { error } = schema.validate(this);

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}

export default GroupRequestModel;
