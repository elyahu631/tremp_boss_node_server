// src/resources/gifts/GiftModel.ts

import Joi from "joi";
import { ObjectId } from 'mongodb';

class GiftModel {
  _id: ObjectId;
  image_URL: string;
  gift_name: string;
  price: number;
  quantity: number;
  collect_place: string;
  deleted: boolean;

  constructor(giftData: {_id: ObjectId, image_URL: string, gift_name: string, price: number, quantity: number, collect_place: string, deleted: boolean}) {
    this._id = giftData._id || new ObjectId;
    this.image_URL = giftData.image_URL;
    this.gift_name = giftData.gift_name;
    this.price = giftData.price;
    this.quantity = giftData.quantity;
    this.collect_place = giftData.collect_place;
    this.deleted = giftData.deleted || false;
  }

  validateGift() {
    const schema = Joi.object({
      _id: Joi.optional(),
      image_URL: Joi.string().optional(),
      gift_name: Joi.string().required(),
      price: Joi.number().required(),
      quantity: Joi.number().required(),
      collect_place: Joi.string().required(),
      deleted: Joi.boolean().required()
    });

    const { error } = schema.validate(this);

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}

export default GiftModel;


