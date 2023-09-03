import db from '../../utils/db';
import GroupModel from './GroupModel';

class GroupDataAccess {
  static collection = 'Groups';

  async getGeneralGroup() {
    return (await db.FindAll(GroupDataAccess.collection, { type: 'GENERAL' }))[0];
  }

  async FindAllGroups(query = {},projection = {}) {
    return await db.FindAll(GroupDataAccess.collection, query, projection, { group_name: 1 });
  }

  async FindById(id: string,projection = {}) {
    return await db.FindByID(GroupDataAccess.collection, id,projection);
  }

  async DeleteGroupById(id: string) {
    return await db.DeleteById(GroupDataAccess.collection, id);
  }

  async InsertOne(group: GroupModel) {
    if (typeof group.locations === 'string') {
      try {
        group.locations = JSON.parse(group.locations);
      } catch (error) {
        console.error('Error parsing locations:', error);
        // Handle the error appropriately for your application.
      }
    }
    group.validateGroup();
    return await db.Insert(GroupDataAccess.collection, group);
  }


  async UpdateGroup(id: string, updateData: Partial<GroupModel>) {
    return await db.Update(GroupDataAccess.collection, id, updateData);
  } 
}

export default GroupDataAccess;
