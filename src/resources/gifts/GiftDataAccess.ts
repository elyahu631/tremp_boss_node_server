// src/resources/gifts/GiftDataAccess.ts

import db from '../../utils/db';
import GiftModel from './GiftModel';

class GiftDataAccess {
  static collection = 'Gifts';

  async FindAllGifts(query = {}) {
    return await db.FindAll(GiftDataAccess.collection, query);
  }

  async FindById(id: string) {
    return await db.FindByID(GiftDataAccess.collection, id);
  }

  async InsertOne(gift: GiftModel) {
    gift.validateGift();
    return await db.Insert(GiftDataAccess.collection, gift);
  }

  async DeleteGiftById(id: string) {
    return await db.DeleteById(GiftDataAccess.collection, id);
  }

  async UpdateGift(id: string, updateData: Partial<GiftModel>) {
    return await db.Update(GiftDataAccess.collection, id, updateData);
  } 
}


export default GiftDataAccess;
