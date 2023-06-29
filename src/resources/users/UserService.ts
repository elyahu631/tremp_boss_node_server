// src/resources/users/UserService.ts

import bcrypt from 'bcrypt';
import UserModel from "./UserModel";
import UserDataAccess from "./UserDataAccess";

const userDataAccess = new UserDataAccess();
const saltRounds = 10; 

export async function registerUser(user_email: string, password: string) {
  const existingUser = await userDataAccess.FindAllUsers({ user_email });

  if (existingUser && existingUser.length) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = new UserModel({
    user_email,
    password: hashedPassword,
  });

  return userDataAccess.InsertOne(newUser);
}



export async function loginUser(user_email: string, password: string) {
  const users = await userDataAccess.FindAllUsers({
    user_email,
    status: "active",
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
  return userDataAccess.FindById(id);
}

export async function deleteUserById(id: string) {
  return userDataAccess.DeleteUserById(id);
}

export async function updateUser(id: string, updatedUser: UserModel) {
  return userDataAccess.Update(id, updatedUser);
}

export async function addUser(user_email: string, password: string) {
  const newUser = new UserModel({ user_email, password });
  return userDataAccess.InsertOne(newUser);
}
