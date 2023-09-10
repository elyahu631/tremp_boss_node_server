// src/resources/users/UserDataAccess.ts

import db from '../../utils/db';
import GroupDataAccess from '../groups/GroupDataAccess';
import { UserInterface } from './UserInterface';
import UserModel from './UserModel';

class UserDataAccess {
  static collection = 'Users';

  async FindAllUsers(query = {}, projection = {}, sort = {}) {
    return await db.FindAll(UserDataAccess.collection, query, projection, sort);
  }

  async FindOneUser(query = {}) {
    return await db.FindOne(UserDataAccess.collection, query);
  }

  async FindById(id: string) {
    return await db.FindByID(UserDataAccess.collection, id);
  }

  async DeleteUserById(id: string) {
    return await db.DeleteById(UserDataAccess.collection, id);
  }

  async InsertOne(user: UserModel) {
    user.validateUser();

    if (!user.groups || user.groups.length === 0) {
      const groupDataAccess = new GroupDataAccess();
      const generalGroup = await groupDataAccess.getGeneralGroup();
      if (generalGroup) {
        user.groups = [generalGroup._id];
      }
    }

    return await db.Insert(UserDataAccess.collection, user);
  }

  async Update(id: string, updatedUser: Partial<UserModel>) {
    return await db.Update(UserDataAccess.collection, id, updatedUser);
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

export default UserDataAccess;
