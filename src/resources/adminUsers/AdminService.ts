// src/resources/adminUsers/AdminService.ts

import bcrypt from "bcrypt";
import AdminModel from "./AdminModel";
import AdminDataAccess from "./AdminDataAccess";
import { uploadImageToFirebase } from "../../firebase/fileUpload";
import { getCurrentTimeInIsrael } from "../../utils/TimeService";


const adminDataAccess = new AdminDataAccess();
const saltRounds = 10;


export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

export async function loginUser(username: string, password: string) {
  const users =
    (await adminDataAccess.FindAllUsers({
      username,
      account_activated: true,
      deleted: false,
    })) || [];
  const user = users[0];


  if (!user || !(await bcrypt.compare(password, user.password))) {
    // return null if user not found or password doesn't match

    return null;
  }
  await adminDataAccess.UpdateUserDetails(user._id.toString(), { last_login_date:  getCurrentTimeInIsrael() });

  return user;
}

export async function createUser(user: AdminModel) {
  // Check if user with this username or email already exists
  const existingUsers = await adminDataAccess.FindAllUsers({
    $or: [
      { username: user.username },
      { email: user.email },
      { phone_number: user.phone_number },
    ],
  });

  if (existingUsers.length > 0) {
    throw new Error("User with this username or email already exists.");
  }

  // Encrypt the user's password before saving to database
  user.password = await hashPassword(user.password);

  user.account_activated = (user.account_activated.toString() === 'true');
  // Insert the new user into the database
  return adminDataAccess.InsertOne(user);
}

export async function getUserById(id: string) {
  return adminDataAccess.FindById(id);
}

export async function deleteUserById(id: string) {
  return adminDataAccess.DeleteUserById(id);
}

export async function getAllUsers() {
  return adminDataAccess.FindAllUsers();
}

export async function markUserAsDeleted(id: string) {
  return adminDataAccess.UpdateUserDeletionStatus(id);
}

export async function updateUserDetails(
  id: string,
  userDetails: AdminModel,
  file?: Express.Multer.File
) {
  let updateData: Partial<AdminModel> = {
    ...userDetails,
    updatedAt: getCurrentTimeInIsrael(),
  };

  // If account_activated is defined, ensure it is a boolean
  if (updateData.account_activated !== undefined) {
    updateData.account_activated = ""+updateData.account_activated === "true";
  }

  // If a new password is provided, hash it before storing
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  // If a file is provided, upload it and update photo_URL
  if (file) {
    try {
      const filePath = `adminimages/${id}`;
      updateData.photo_URL = await uploadImageToFirebase(file, filePath);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  try {
    return await adminDataAccess.UpdateUserDetails(id, updateData);
  } catch (error) {
    console.error("Error updating user details:", error);
    throw(error);
  }
}

export async function uploadImageToFirebaseAndUpdateUser(
  file: Express.Multer.File,
  filePath: string,
  userId: string
) {
  const photo_URL = await uploadImageToFirebase(file, filePath);
  return adminDataAccess.UpdateUserDetails(userId, { photo_URL });
}
