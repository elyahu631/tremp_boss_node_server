// src/resources/adminUsers/AdminService.ts

import bcrypt from "bcrypt";
import AdminModel from "./AdminModel";
import AdminDataAccess from "./AdminDataAccess";
import { uploadImageToFirebase } from "../../firebase/fileUpload";
import { utcToZonedTime, format } from 'date-fns-tz';


const adminDataAccess = new AdminDataAccess();
const saltRounds = 10;

export function getCurrentTimeInIsrael(): string {
  const timeZone = 'Asia/Jerusalem';
  const loginDate = new Date();

  // Convert the date in that timezone
  const zonedDate = utcToZonedTime(loginDate, timeZone);
  const loginDateISOString = format(zonedDate, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone });

  return loginDateISOString;
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
  const salt = bcrypt.genSaltSync(saltRounds);
  user.password = bcrypt.hashSync(user.password, salt);

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
  return adminDataAccess.FindAllUsers({}, { password: 0 });
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
    username: userDetails.username,
    email: userDetails.email,
    first_name: userDetails.first_name,
    last_name: userDetails.last_name,
    role: userDetails.role,
    phone_number: userDetails.phone_number,
    photo_URL: userDetails.photo_URL,
    account_activated: userDetails.account_activated,
    password: userDetails.password,
    updatedAt:  getCurrentTimeInIsrael()
  };

  updateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined)
  );

  if (updateData.account_activated) {
    updateData.account_activated = (updateData.account_activated.toString() === 'true');
  }

  if (file) {
    const filePath = `adminimages/${id}`;
    updateData.photo_URL = await uploadImageToFirebase(file, filePath);
  }

  return adminDataAccess.UpdateUserDetails(id, updateData);
}

export async function uploadImageToFirebaseAndUpdateUser(
  file: Express.Multer.File,
  filePath: string,
  userId: string
) {
  const photo_URL = await uploadImageToFirebase(file, filePath);
  return adminDataAccess.UpdateUserDetails(userId, { photo_URL });
}
