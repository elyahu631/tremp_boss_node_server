import db from '../../utils/db';
import UserGroupsModel from './UserGroupsModel';

class UserGroupsDataAccess {
  static collection = 'UserGroups';


  async FindAllUserGroups(query = {}, projection = {}) {
    return await db.FindAll(UserGroupsDataAccess.collection, query, projection);
  }

  async FindById(id: string) {
    return await db.FindByID(UserGroupsDataAccess.collection, id);
  }

  async InsertOne(userGroups: UserGroupsModel) {
    userGroups.validateUserGroupReq();
    return await db.Insert(UserGroupsDataAccess.collection, userGroups);
  }
  async UpdateUserGroups(id: string, updateData: Partial<UserGroupsModel>) {
    return await db.Update(UserGroupsDataAccess.collection, id, updateData);
  }
}

export default UserGroupsDataAccess;
