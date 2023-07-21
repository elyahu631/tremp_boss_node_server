// src/resources/adminUsers/AdminDataAccess.ts

import DB from '../../utils/db';
import AdminModel from './AdminModel';

class AdminDataAccess {
  static collection = 'AdminUsers';

  async FindAllUsers(query = {}, projection = {}) {

    return await new DB().FindAll(AdminDataAccess.collection, query, projection);
  }

  async FindById(id: string) {
    return await new DB().FindByID(AdminDataAccess.collection, id);
  }

  async DeleteUserById(id: string) {
    return await new DB().DeleteById(AdminDataAccess.collection, id);
  }

  async InsertOne(admin: AdminModel) {
    admin.validateNewAdmin();
    return await new DB().Insert(AdminDataAccess.collection, admin);
  }

  /**
 Updates the deletion status of a user.
 @param id - The ID of the user to update.
 @returns A promise that resolves to the updated user object or an error if the update fails.
 */
  async UpdateUserDeletionStatus(id: string): Promise<any> {
    try {
      return await new DB().Update(AdminDataAccess.collection, id, {
        deleted: true,
        account_activated: false
      });
    } catch (error) {
      return error;
    }
  }

  async UpdateUserDetails(id: string, updateData: Partial<AdminModel>) {
    return await new DB().Update(AdminDataAccess.collection, id, updateData);
  }
}

export default AdminDataAccess;
