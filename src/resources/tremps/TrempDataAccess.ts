// src/resources/tremps/TrempDataAccess.ts
import db from '../../utils/db';
import TrempModel from './TrempModel';
import { UserInTrempUpdateQuery } from './TrempInterfaces';
import UserDataAccess from '../users/UserDataAccess';

class TrempDataAccess {
  static collection = 'Tremps';


  async insertTremp(tremp: TrempModel) {
    return await db.Insert(TrempDataAccess.collection, tremp);
  }

  async insertTremps(tremps: TrempModel[]) {
    return await db.InsertMany(TrempDataAccess.collection, tremps);
  }

  async FindTrempsByFilters(query = {}) {
    const projection = {
      _id: 1,
      creator_id: 1,
      group_id: 1,
      tremp_type: 1,
      tremp_time: 1,
      from_route: 1,
      to_route: 1,
      note: 1,
      seats_amount: 1,
      users_in_tremp: 1,
    };
    return await db.FindAll(TrempDataAccess.collection, query, projection, { tremp_time: 1 });
  }

  async FindAll(query = {}, projection = {}, sort = { tremp_time: 1 }) {
    return await db.FindAll(TrempDataAccess.collection, query, projection, sort);
  }

  async UpdateTremp(tremp_id: string, query: UserInTrempUpdateQuery) {
    return await db.UpdateWithOperation(TrempDataAccess.collection, tremp_id, query);
  }

  async FindByID(id: string) {
    return await db.FindByID(TrempDataAccess.collection, id);
  }

  async Update(id: string, updateQuery: any) {
    return await db.Update(TrempDataAccess.collection, id, updateQuery);
  }

  async getAllTremps() {
    const pipeline = [
      {
        $match: {
          deleted: false,
        },
      },
      {
        $lookup: {
          from: 'Groups',
          localField: 'group_id',
          foreignField: '_id',
          as: 'group',
        },
      },
      {
        $unwind: '$group',
      },
      {
        $project: {
          _id: 1,
          tremp_type: 1,
          create_date: 1,
          tremp_time: 1,
          from_route: 1,
          to_route: 1,
          seats_amount: 1,
          is_full: 1,
          is_completed: 1,
          tremp_group: '$group.group_name',
        },
      },
    ];

    return await db.aggregate('Tremps', pipeline);
  }


}

export default TrempDataAccess;
