import DB from '../../utils/db';
import GroupModel from './GroupModel';

class GroupDataAccess {
  static collection = 'Groups';
  private db: DB;

  constructor() {
    this.db = new DB();
  }

  async FindAllGroups(query = {}) {
    return await this.db.FindAll(GroupDataAccess.collection, query);
  }

  async FindById(id: string) {
    return await this.db.FindByID(GroupDataAccess.collection, id);
  }

  async DeleteGroupById(id: string) {
    return await this.db.DeleteById(GroupDataAccess.collection, id);
  }

  async InsertOne(group: GroupModel) {
    if (typeof group.location === 'string') {
      try {
        group.location = JSON.parse(group.location);
      } catch (error) {
        console.error('Error parsing locations:', error);
        // Handle the error appropriately for your application.
      }
    }
    group.validateGroup();
    return await this.db.Insert(GroupDataAccess.collection, group);
  }


  async UpdateGroup(id: string, updateData: Partial<GroupModel>) {
    return await this.db.Update(GroupDataAccess.collection, id, updateData);
  } 
}

export default GroupDataAccess;
