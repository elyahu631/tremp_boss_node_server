import db from '../../utils/db';
import GroupModel from './GroupModel';

class GroupDataAccess {
  static collection = 'Groups';


  async FindAllGroups(query = {}) {
    return await db.FindAll(GroupDataAccess.collection, query, {}, { group_name: 1 });
  }

  async FindById(id: string) {
    return await db.FindByID(GroupDataAccess.collection, id);
  }

  async DeleteGroupById(id: string) {
    return await db.DeleteById(GroupDataAccess.collection, id);
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
    return await db.Insert(GroupDataAccess.collection, group);
  }


  async UpdateGroup(id: string, updateData: Partial<GroupModel>) {
    return await db.Update(GroupDataAccess.collection, id, updateData);
  } 
}

export default GroupDataAccess;
