import db from '../../utils/db';
import GroupRequestModel from './GroupRequestModel';

class GroupRequesDataAccess {
  static collection = 'GroupRequests';


  async FindAllGroupReq(query = {}) {
    return await db.FindAll(GroupRequesDataAccess.collection, query, {}, { request_date: 1, group_name: 1 });
  }

  async FindById(id: string) {
    return await db.FindByID(GroupRequesDataAccess.collection, id);
  }

  async DeleteGroupReqById(id: string) {
    return await db.DeleteById(GroupRequesDataAccess.collection, id);
  }

  async InsertOne(groupReq: GroupRequestModel) {
    groupReq.validateGroupRequest();
    return await db.Insert(GroupRequesDataAccess.collection, groupReq);
  }


  async UpdateGroup(id: string, updateData: Partial<GroupRequestModel>) {
    return await db.Update(GroupRequesDataAccess.collection, id, updateData);
  }

  

}

export default GroupRequesDataAccess;
