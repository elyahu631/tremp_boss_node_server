// src/resources/users/UserDataAccess.ts

import db from '../../utils/db';
import { UserInterface } from './UserInterface';
import UserModel  from './UserModel';

class UserDataAccess  {
  static collection = 'Users';

  async FindAllUsers(query = {},projection = {}) {
    return await db.FindAll(UserDataAccess .collection, query,projection);
  }

  async FindById(id: string) {
    return await db.FindByID(UserDataAccess .collection, id);
  }

  async DeleteUserById(id: string) {
    return await db.DeleteById(UserDataAccess .collection, id);
  }

  async InsertOne(user: UserModel) {
    user.validateUser();
    return await db.Insert(UserDataAccess .collection, user);
  }

  async Update(id: string, updatedUser: Partial<UserModel>) {
    return await db.Update(UserDataAccess .collection, id, updatedUser);
  }

  async UpdateUserDeletionStatus(id: string) {
    try {
      return await db.Update(UserDataAccess.collection, id, { 
        deleted: true,
        status: "inactive"
      });
          } catch (error) {
      return error;
    }
  }

  async UpdateUserDetails(id: string, updateData: Partial<UserInterface>) {
    return await db.Update(UserDataAccess.collection, id, updateData);
  }  
}

export default UserDataAccess ;
