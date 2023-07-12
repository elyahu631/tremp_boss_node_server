// src/resources/users/UserService.ts

import bcrypt from 'bcrypt';
import UserModel from "./UserModel";
import UserDataAccess from "./UserDataAccess";
import { uploadImageToFirebase } from '../../firebase/fileUpload';
import { getCurrentTimeInIsrael } from '../../utils/TimeService';

const userDataAccess = new UserDataAccess();
const saltRounds = 10;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

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
  // Update the last_login_date field when the user logs in successfully
  user.last_login_date = new Date().toISOString();
  await userDataAccess.UpdateUserDetails(user._id.toString(), user);

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

export async function getAllUsers() {
  return userDataAccess.FindAllUsers({deleted:false}); 
}

export async function markUserAsDeleted(id: string) {
  return userDataAccess.UpdateUserDeletionStatus(id);
}

export async function uploadImageToFirebaseAndUpdateUser(
  file: Express.Multer.File,
  filePath: string,
  userId: string
) {
  const photo_URL = await uploadImageToFirebase(file, filePath);
  return userDataAccess.UpdateUserDetails(userId, { photo_URL });
}

export async function createUser(user: UserModel) {
  // Check if user with this username or email already exists
  const existingUsers = await userDataAccess.FindAllUsers({
    $or: [
      { email: user.user_email },
    ],
  });

  if (!user.user_email) {
    throw new Error("email field is empty.");
  }
  else if (existingUsers.length > 0) {
    throw new Error("User with this email already exists.");
  }

  // Encrypt the user's password before saving to database
  user.password = await hashPassword(user.password);

  // Insert the new user into the database
  return userDataAccess.InsertOne(user);
}

export async function updateUserDetails(id: string, userDetails: UserModel, file?: Express.Multer.File) {
  let updateData: Partial<UserModel> = {
    ...userDetails,
    updatedAt: getCurrentTimeInIsrael(),
  };

  // If a new password is provided, hash it before storing
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  // If a file is provided, upload it and update photo_URL
  if (file) {
    try {
      const filePath = `usersimages/${id}`;
      updateData.photo_URL = await uploadImageToFirebase(file, filePath);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  try {
    return await userDataAccess.UpdateUserDetails(id, updateData);
  } catch (error) {
    console.error("Error updating user details:", error);
    throw (error);
  }
}
