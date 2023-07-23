// src/resources/tremps/TrempDataAccess.ts
import { ObjectId } from 'mongodb';
import DB from '../../utils/db';
import TrempModel from './TrempModel';
import { UserInTrempUpdateQuery } from './TrempInterfaces';
const db = new DB();

class TrempDataAccess {
  static collection = 'Tremps';


  async insertTremp(tremp: TrempModel) {
    return await db.Insert(TrempDataAccess.collection, tremp);
  }

  async FindTrempsByFilters(query = {}) {
    const projection = {
      _id: 1,
      creator_id:1,
      group_id: 1,
      tremp_type: 1,
      tremp_time: 1,
      from_root: 1,
      to_root: 1,
      note: 1,
      seats_amount: 1,
    };
    return await db.FindAll(TrempDataAccess.collection, query, projection,{ tremp_time: 1 });
  }

  async FindAll(query = {}) {
    return await db.FindAll(TrempDataAccess.collection, query);
  }

  async addUserToTremp(tremp_id: string, query: UserInTrempUpdateQuery) {
    return await db.UpdateWithOperation(TrempDataAccess.collection, tremp_id, query);
  }

  async FindByID(id: string) {
    return await db.FindByID(TrempDataAccess.collection, id);
  }

  async Update(id: string, updateQuery: any) {
    const db = new DB();
    return await db.Update(TrempDataAccess.collection, id, updateQuery);
  }

}

export default TrempDataAccess;
