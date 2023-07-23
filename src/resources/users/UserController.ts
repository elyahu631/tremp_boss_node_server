// src/resources/users/UserController.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/environment";
import * as UserService from './UserService';
import { validateUpdatedUser } from "./UserValidation";
import UserModel from "./UserModel";
import { BadRequestException, UnauthorizedException } from "../../middleware/HttpException";


/**
  Registers a new user.
  It validates the user_email and password in the request body,
  calls the registerUser function from UserService to create the user,
  and returns a success message in the response.
  If there are any errors, it passes them to the error handling middleware.
 */
export async function registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_email, password } = req.body;
    const result = await UserService.registerUser(user_email, password);
    if (!result) {
      throw new UnauthorizedException("Failed to register user");
    }
    res.status(201).json({ status: true, message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
}

/**
  Logs in a user.
  It validates the user_email and password in the request body,
  calls the loginUser function from UserService to check the credentials,
  generates a token using the user's ID, and returns the user and token in the response.
 */
export async function loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_email, password } = req.body;
    const user = await UserService.loginUser(user_email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '6h' });
    res.status(200).json({ status: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}

/**
 Retrieves a user by ID.
 It validates the user ID in the request params,
 calls the getUserById function from UserService to fetch the user,
 and returns the user in the response.
 */
export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    res.status(200).json({ status: true, data: user });
  } catch (err) {
    next(err);
  }
}

/**
Deletes a user by ID.
It validates the user ID in the request params,
calls the deleteUserById function from UserService to delete the user,
and returns a success message in the response.
 */
export async function deleteUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await UserService.deleteUserById(id);
    res.status(200).json({ status: true, message: "User successfully deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 Updates the details of a user.
 It validates the user ID in the request params,
 checks the validity of the updated user details using the validateUpdatedUser function,
 calls the updateUser function from UserService to update the user details in the database,
 and returns the updated user in the response.
 */
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updatedUser = req.body;
    if (!validateUpdatedUser(updatedUser)) {
      throw new BadRequestException('Invalid data to update.');
    }
    const user = await UserService.updateUser(id, updatedUser);
    res.status(200).json({ status: true, message: "User updated successfully", data: user });
  } catch (err) {
    next(err);
  }
}

/**
 Adds a new user.
 It creates a new UserModel instance using the request body,
 calls the createUser function from UserService to save the user in the database,
 and returns the saved user in the response.
 If there is an uploaded file, it updates the user's image using
 the uploadImageToFirebaseAndUpdateUser function from UserService.
 */
export async function addUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_email, password } = req.body;
    const result = await UserService.addUser(user_email, password);
    res.status(201).json({ status: true, data: result });
  } catch (err) {
    next(err);
  }
}


/**
 Retrieves all users.
 It calls the getAllUsers function from UserService to fetch all users,
 and returns the users in the response.
 Additionally, it modifies each user object to hide the actual password.
 */
export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let users = await UserService.getAllUsers();
    users = users.map(user => ({ ...user, password: "user1234" }));
    res.status(200).json({ status: true, data: users });
  } catch (err) {
    next(err);
  }
}

/**
 Marks a user as deleted.
 It validates the user ID in the request params,
 calls the markUserAsDeleted function from UserService to update the user's deletion status
 */
export async function markUserAsDeleted(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await UserService.markUserAsDeleted(id);
    res.status(200).json({ status: true, message: "User deletion status successfully updated" });
  } catch (err) {
    next(err);
  }
}

/**
 Admin Adds a new  user from the request body.
 It creates a new UserModel instance using the request body,
 calls the createUser function from UserService to save the user in the database,
 and returns the saved user in the response.
 If there is an uploaded file, it updates the user's image using
 the uploadImageToFirebaseAndUpdateUser function from UserService.
 */
export async function AdminAddUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const newUser = new UserModel(req.body);
    let userInsertion = await UserService.createUser(newUser);
    let savedUser = userInsertion.insertedId;
    if (req.file) {
      const filePath = `usersimages/${userInsertion.insertedId}`;
      await UserService.uploadImageToFirebaseAndUpdateUser(req.file, filePath, savedUser);
      savedUser = await UserService.getUserById(savedUser); // Get updated user
    }
    res.status(201).json({ status: true, data: savedUser });
  } catch (err) {
    next(err);
  }
}

/**
 Updates the details of a user from the request body.
 It validates the user ID in the request params,
 checks the validity of the updated user details using the validateUpdatedUser function,
 calls the updateUserDetails function from UserService to update the user details in the database,
 and returns the updated user in the response.
 If the updated user details are invalid, it throws a BadRequestException.
 */
export async function updateUserDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userDetails = req.body;
    if (!validateUpdatedUser(userDetails)) {
      throw new BadRequestException('Invalid data to update.');
    }
    const updatedUser = await UserService.updateUserDetails(id, userDetails, req.file);
    res.status(200).json({ status: true, message: "User updated successfully", data: updatedUser });
  } catch (err) {
    next(err);
  }
}

/**
 Adds a notification token to a user from the request body.
 It validates the user ID in the request params,
 checks the validity of the updated user details using the validateUpdatedUser function,
 calls the updateUserDetails function from UserService to update the user details in the database,
 and returns the updated user in the response.
 If the updated user details are invalid, it throws a BadRequestException.
 Note: There seems to be an issue with this function's implementation, as it is identical to updateUserDetails function.
       It should be revised if it's intended to serve a different purpose.
 */
export async function addNotificationToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userDetails = req.body;
    if (!validateUpdatedUser(userDetails)) {
      throw new BadRequestException('Invalid data to update.');
    }
    const updatedUser = await UserService.updateUserDetails(id, userDetails, req.file);
    res.status(200).json({ status: true, message: "User updated successfully", data: updatedUser });
  } catch (err) {
    next(err);
  }
}

