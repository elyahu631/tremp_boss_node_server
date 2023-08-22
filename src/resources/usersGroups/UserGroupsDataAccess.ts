import DB from '../../utils/db';
import UserGroupsModel from './UserGroupsModel';

class UserGroupsDataAccess {
  static collection = 'UserGroups';
  private db: DB;

  constructor() {
    this.db = new DB();
  }

  async FindAllUserGroups(query = {},projection = {}) {
    return await this.db.FindAll(UserGroupsDataAccess.collection, query,projection);
  }

  async FindById(id: string) {
    return await this.db.FindByID(UserGroupsDataAccess.collection, id);
  }

  async InsertOne(userGroups: UserGroupsModel) {
    userGroups.validateUserGroupReq();
    return await new DB().Insert(UserGroupsDataAccess.collection, userGroups);
  }
  async UpdateUserGroups(id: string, updateData: Partial<UserGroupsModel>) {
    return await this.db.Update(UserGroupsDataAccess.collection, id, updateData);
  } 
}

export default UserGroupsDataAccess;
