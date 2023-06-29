// src/resources/adminUsers/AdminService.ts

import bcrypt from 'bcrypt';
import AdminModel from "./AdminModel";
import AdminDataAccess from "./AdminDataAccess";

const adminDataAccess = new AdminDataAccess();
const saltRounds = 10; 

export async function createUser(user: AdminModel) {
  // Check if user with this username or email already exists
  const existingUsers = await adminDataAccess.FindAllUsers({
    $or: [
      { username: user.username },
      { email: user.email }
    ]
  });

  if (existingUsers.length > 0) {
    throw new Error("User with this username or email already exists.");
  }

  // Encrypt the user's password before saving to database
  const salt = bcrypt.genSaltSync(saltRounds);
  user.password = bcrypt.hashSync(user.password, salt);

  // Insert the new user into the database
  return adminDataAccess.InsertOne(user);
}


export async function loginUser(username: string, password: string) {
  const users = await adminDataAccess.FindAllUsers({
    username,
    account_activated: true,
    deleted: false,
  }) || [];

  const user = users[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    // return null if user not found or password doesn't match
    return null;
  }

  return user;
}


export async function getUserById(id: string) {
  return adminDataAccess.FindById(id);
}

export async function deleteUserById(id: string) {
  return adminDataAccess.DeleteUserById(id);
}


