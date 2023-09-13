// src/resources/adminUsers/AdminService.ts
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/environment";
import bcrypt from "bcrypt";
import AdminModel from "./AdminModel";
import AdminDataAccess from "./AdminDataAccess";
import { uploadImageToFirebase } from "../../firebase/fileUpload";
import { getCurrentTimeInIsrael } from "../../services/TimeService";
import { BadRequestException, InternalServerException, NotFoundException, UnauthorizedException } from "../../middleware/HttpException";
import { MongoError } from "mongodb";


const adminDataAccess = new AdminDataAccess();
const saltRounds = 10;

/**
 * Hashes the provided password using bcrypt.
 * @param password The password to hash.
 * @returns that hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Logs in an admin user with the provided username and password.
 * @param username The username of the admin user.
 * @param password The password of the admin user.
 * @returns The logged-in user if successful, null otherwise.
 */
export async function loginUser(username: string, password: string) {
  const users =
    (await adminDataAccess.FindAllUsers({
      username,
      account_activated: true,
      deleted: false,
    })) || [];
  const user = users[0];


  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }
  await adminDataAccess.UpdateUserDetails(user._id.toString(), { last_login_date:  getCurrentTimeInIsrael() });

  return user;
}



export async function validateUserByTokenService(token: string) {
  const decoded: any = jwt.verify(token, JWT_SECRET);
  
  if (!decoded || !decoded.id) {
    throw new UnauthorizedException("Invalid token.");
  }
  
  const user = await adminDataAccess.FindById(decoded.id);
  if (!user) {
    throw new NotFoundException("User not found.");
  }
  
  return { user };
}





/**
 * Creates a new admin user.
 * @param user The user object representing the admin user.
 * @returns The inserted user object.
 * @throws BadRequestException if a user with the same username or email already exists.
 */
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
    throw new BadRequestException("User with this username or email already exists.");
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
  return adminDataAccess.FindAllUsers({deleted:false});
}

export async function markUserAsDeleted(id: string) {
  return adminDataAccess.UpdateUserDeletionStatus(id);
}

/**
 * Updates the details of an admin user.
 * @param id The ID of the admin user to update.
 * @param userDetails The updated details of the admin user.
 * @param file The optional file for updating the user's image.
 * @returns The updated admin user object.
 * @throws BadRequestException if there is an error updating the user details.
 */
export async function updateUserDetails(id: string,userDetails: AdminModel,file?: Express.Multer.File) {
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

  // If a file is provided, upload it and update image_URL
  if (file) {
    try {
      const filePath = `adminimages/${id}`;
      updateData.image_URL = await uploadImageToFirebase(file, filePath);
    } catch (error) {
      throw new InternalServerException("Error uploading image: " + error);
    }
  }
  try {
    const res = await adminDataAccess.UpdateUserDetails(id, updateData);
    return res    
  } catch (error) {    
    if (error instanceof MongoError && error.code === 11000) {
      // This error code stands for 'Duplicate Key Error'
      const keyValue = (error as any).keyValue;
      throw new BadRequestException(`User with this ${Object.keys(keyValue)[0]} already exists.`);
    }   
    throw new BadRequestException("Error updating user details: "+  error);
  }
}

/**
 * Uploads an image to Firebase and updates the user's image URL.
 * @param file The file to upload.
 * @param filePath The file path in Firebase storage.
 * @param userId The ID of the user to update.
 * @returns The updated user object.
 */
export async function uploadImageToFirebaseAndUpdateUser(
  file: Express.Multer.File,
  filePath: string,
  userId: string
) {
  const image_URL = await uploadImageToFirebase(file, filePath);
  return adminDataAccess.UpdateUserDetails(userId, { image_URL });
}
