// src/resources/tremps/TrempDataAccess.ts
import DB from '../../utils/db';
import TrempModel from './TrempModel';
class TrempDataAccess {
  static collection = 'Tremps';

  async insertTremp(tremp: TrempModel) {
    return await new DB().Insert(TrempDataAccess.collection, tremp);
  }

  async FindTrempsByFilters(query = {}) {
    console.log(query);
    
    return await new DB().FindAll(TrempDataAccess.collection, query);
  }
}

export default TrempDataAccess;
