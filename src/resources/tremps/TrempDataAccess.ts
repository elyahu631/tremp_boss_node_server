// src/resources/tremps/TrempDataAccess.ts
import { ObjectId } from 'mongodb';
import DB from '../../utils/db';
import TrempModel from './TrempModel';
import { UserInTrempUpdateQuery } from './trempInterfaces'; 
const db = new DB();
class TrempDataAccess {
  static collection = 'Tremps';
  

  async insertTremp(tremp: TrempModel) {
    return await db.Insert(TrempDataAccess.collection, tremp);
  }

  async FindTrempsByFilters(query = {}) {
    console.log(query);    
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
