// src/resources/users/UserDataAccess.ts

import DB from '../../utils/db';
import { UserInterface } from './UserInterface';
import UserModel  from './UserModel';

class UserDataAccess  {
  static collection = 'Users';

  async FindAllUsers(query = {},projection = {}) {
    return await new DB().FindAll(UserDataAccess .collection, query,projection);
  }

  async FindById(id: string) {
    return await new DB().FindByID(UserDataAccess .collection, id);
  }

  async DeleteUserById(id: string) {
    return await new DB().DeleteById(UserDataAccess .collection, id);
  }

  async InsertOne(user: UserModel) {
    user.validateUser();
    return await new DB().Insert(UserDataAccess .collection, user);
  }

  async Update(id: string, updatedUser: UserModel) {
    return await new DB().Update(UserDataAccess .collection, id, updatedUser);
  }

  async UpdateUserDeletionStatus(id: string) {
    try {
      return await new DB().Update(UserDataAccess.collection, id, { 
        deleted: true,
        status: "inactive"
      });
          } catch (error) {
      return error;
    }
  }

  async UpdateUserDetails(id: string, updateData: Partial<UserInterface>) {
    return await new DB().Update(UserDataAccess.collection, id, updateData);
  }  
}

export default UserDataAccess ;
