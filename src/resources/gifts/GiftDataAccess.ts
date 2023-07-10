// src/resources/gifts/GiftDataAccess.ts

import DB from '../../utils/db';
import GiftModel from './GiftModel';

class GiftDataAccess {
  static collection = 'Gifts';
  private db: DB;

  constructor() {
    this.db = new DB();
  }

  async FindAllGifts(query = {}) {
    return await this.db.FindAll(GiftDataAccess.collection, query);
  }

  async FindById(id: string) {
    return await this.db.FindByID(GiftDataAccess.collection, id);
  }

  async InsertOne(gift: GiftModel) {
    gift.validateGift();
    return await this.db.Insert(GiftDataAccess.collection, gift);
  }

  async DeleteGiftById(id: string) {
    return await this.db.DeleteById(GiftDataAccess.collection, id);
  }

  async UpdateGift(id: string, updateData: Partial<GiftModel>) {
    return await this.db.Update(GiftDataAccess.collection, id, updateData);
  } 
}


export default GiftDataAccess;
