// src/resources/users/UserService.ts
import bcrypt from 'bcrypt';
import UserModel from "./UserModel";
import UserDataAccess from "./UserDataAccess";
import GroupDataAccess from '../groups/GroupDataAccess';
import { uploadImageToFirebase } from '../../firebase/fileUpload';
import { getCurrentTimeInIsrael } from '../../services/TimeService';
import { BadRequestException, UnauthorizedException } from '../../middleware/HttpException';
import { MongoError, ObjectId } from 'mongodb';
import crypto from 'crypto';
import { EmailService } from '../../services/EmailService';

const userDataAccess = new UserDataAccess();
const emailService = new EmailService();

const saltRounds = 10;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

export async function registerUser(email: string, password: string) {
  const existingUser = await userDataAccess.FindAllUsers({ email });

  if (existingUser && existingUser.length) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Generate a verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  const newUser = new UserModel({
    email,
    password: hashedPassword,
    isVerified: false,  // Set to false initially
    verificationToken: verificationToken
  });

  const result = await userDataAccess.InsertOne(newUser);
  if (result) {
    emailService.sendVerificationEmail(email, verificationToken);
  }

  return result;
}

export async function verifyUserEmail(token: string): Promise<string> {
  console.log(token);
  const user = await userDataAccess.FindOneUser({ verificationToken: token });
  console.log(user.email);
  console.log(user._id.toString());

  if (user) {
    user.isVerified = true;
    await userDataAccess.UpdateUserDetails(user._id.toString(), user);
    return "Email verified successfully";
  } else {
    throw new BadRequestException("Invalid or expired verification link");
  }
}

export async function loginUser(email: string, password: string) {
  const users = await userDataAccess.FindAllUsers({
    email,
    status: "active",
    deleted: false,
  }) || [];

  const user = users[0];

  // return null if user not found or password doesn't match
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedException('Invalid email or password.');
  }

  // Update the last_login_date field when the user logs in successfully
  user.last_login_date = getCurrentTimeInIsrael();

  await userDataAccess.UpdateUserDetails(user._id.toString(), user);

  const userModel = UserModel.fromUserDocument(user);
  const isProfileComplete = userModel.isProfileComplete();

  // Fetch groups associated with the user
  const groupDataAccess = new GroupDataAccess();
  const groupIds = user.groups || [];

  const userGroups = await groupDataAccess.FindAllGroups({
    _id: { $in: groupIds },
    deleted: false,
    active: "active"
  }, {
    group_name: 1,
    type: 1,
    locations: 1,

  });

  return { user, isProfileComplete, userGroups };
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  const user = await userDataAccess.FindOneUser({ email });
  
  if (!user) {
    throw new BadRequestException("User not found");
  }

  const code = generateResetCode();
  await setResetCodeForUser(user, code);

  emailService.sendResetCode(email, code);
  return true;
}
function generateResetCode(): number {
  return Math.floor(1000 + Math.random() * 9000);
}
async function setResetCodeForUser(user: any, code: number): Promise<void> {
  user.resetCode = code;
  user.resetCodeExpiration = Date.now() + 15 * 60 * 1000;

  await userDataAccess.UpdateUserDetails(user._id.toString(), user);
}


export async function resetPassword(email: string, code: string, newPassword: string): Promise<string> {
  const user = await userDataAccess.FindOneUser({ email });

  if (!user || user.resetCode !== Number(code) || Date.now() > user.resetCodeExpiration) {
    throw new BadRequestException("Invalid or expired reset code");
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;

  delete user.resetCode;
  delete user.resetCodeExpiration;

  await userDataAccess.UpdateUserDetails(user._id.toString(), user);

  return "Password reset successfully";
}


export async function getUserById(id: string) {
  return userDataAccess.FindById(id);
}

export async function updateUser(id: string, updatedUser: UserModel) {
  return userDataAccess.Update(id, updatedUser);
}

export async function markUserAsDeleted(id: string) {
  return userDataAccess.UpdateUserDeletionStatus(id);
}

export async function uploadUserImage(id: string, file?: Express.Multer.File) {
  const filePath = `usersimages/${id}`;
  const image_URL = await uploadImageToFirebase(file, filePath);
  await userDataAccess.Update(id, { image_URL }); // Pass object with image_URL field
  return image_URL;
}

export async function getAllUsers() {
  return userDataAccess.FindAllUsers({ deleted: false });
}

export async function createUser(user: UserModel) {
  if (!user.email) {
    throw new BadRequestException("email field is empty.");
  }

  user.email = user.email.toLowerCase();
  // Check if user with this username or email already exists
  const existingUsers = await userDataAccess.FindAllUsers({
    $or: [
      { email: user.email },
    ],
  });

  if (existingUsers.length > 0) {
    throw new BadRequestException("User with this email already exists.");
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

  // If a file is provided, upload it and update image_URL
  if (file) {
    try {
      const filePath = `usersimages/${id}`;
      updateData.image_URL = await uploadImageToFirebase(file, filePath);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }
  try {
    const res = await userDataAccess.UpdateUserDetails(id, updateData);
    return res
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      // This error code stands for 'Duplicate Key Error'
      const keyValue = (error as any).keyValue;
      throw new BadRequestException(`User with this ${Object.keys(keyValue)[0]} already exists.`);
    }
    throw new BadRequestException("Error updating user details: " + error);
  }
}

export async function deleteUserById(id: string) {
  return userDataAccess.DeleteUserById(id);
}

export async function uploadImageToFirebaseAndUpdateUser(
  file: Express.Multer.File,
  filePath: string,
  userId: string
) {
  const image_URL = await uploadImageToFirebase(file, filePath);
  return userDataAccess.UpdateUserDetails(userId, { image_URL });
}

export async function getUserGroups(userId: string) {
  const user = await userDataAccess.FindById(userId);
  if (!user) {
    throw new BadRequestException("User not found");
  }


  const groupDataAccess = new GroupDataAccess();
  const groupIds = user.groups || [];

  // Use the query to filter out the groups directly in the database
  const userGroups = await groupDataAccess.FindAllGroups({
    _id: { $in: groupIds },
    deleted: false,
    active: "active"
  }, {
    group_name: 1,
    type: 1,
    locations: 1,

  });

  return userGroups;
}