// src/resources/adminUsers/AdminDataAccess.ts

import db from '../../utils/db';
import AdminModel from './AdminModel';

class AdminDataAccess {
  static collection = 'AdminUsers';

  async FindAllUsers(query = {}, projection = {}) {

    return await db.FindAll(AdminDataAccess.collection, query, projection);
  }

  async FindById(id: string) {
    return await db.FindByID(AdminDataAccess.collection, id);
  }

  async DeleteUserById(id: string) {
    return await db.DeleteById(AdminDataAccess.collection, id);
  }

  async InsertOne(admin: AdminModel) {
    admin.validateNewAdmin();
    return await db.Insert(AdminDataAccess.collection, admin);
  }

  /**
 Updates the deletion status of a user.
 @param id - The ID of the user to update.
 @returns A promise that resolves to the updated user object or an error if the update fails.
 */
  async UpdateUserDeletionStatus(id: string): Promise<any> {
    try {
      return await db.Update(AdminDataAccess.collection, id, {
        deleted: true,
        account_activated: false
      });
    } catch (error) {
      return error;
    }
  }

  async UpdateUserDetails(id: string, updateData: Partial<AdminModel>) {
    return await db.Update(AdminDataAccess.collection, id, updateData);
  }
}

export default AdminDataAccess;
