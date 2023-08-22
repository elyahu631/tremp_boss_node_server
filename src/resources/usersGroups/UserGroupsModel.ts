// src/resources/tremps/TrempModel.ts

import Joi from "joi";
import { ObjectId } from "mongodb";
import { getCurrentTimeInIsrael } from "../../services/TimeService";

class UserGroupsModel {
  user_id: ObjectId;
  group_id: ObjectId;
  request_date: Date;
  is_approved: String;


  constructor(userGroupReqData: Partial<UserGroupsModel>) {
    this.user_id = userGroupReqData.user_id;
    this.group_id = userGroupReqData.group_id;
    this.request_date = userGroupReqData.request_date || getCurrentTimeInIsrael();
    this.is_approved = userGroupReqData.is_approved ||'pending'
  }

  validateUserGroupReq() {
    const schema = Joi.object({
      user_id: Joi.required(),
      group_id: Joi.required(),
      request_date: Joi.date().required(),
      is_approved: Joi.string().valid('approved', 'pending', 'denied').default('pending'),
    });

    const { error } = schema.validate(this);
    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
export default UserGroupsModel;
