// src/resources/adminUsers/AdminController.ts

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/environment";
import { validateAdminUpdates } from "./AdminValidation";
import * as AdminService from "./AdminService";
import AdminModel from "./AdminModel";
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "../../middleware/HttpException";

/**
  Logs in an admin user.
  It validates the username and password in the request body,
  calls the loginUser function from AdminService to check the credentials,
  generates a token using the user's ID, and returns the user and token in the response.
  If there are any errors, it passes them to the error handling middleware.
 */
export async function loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const user = await AdminService.loginUser(username, password);
    if (!user) {
      throw new UnauthorizedException("Invalid user or password.");
    }

    const token = jwt.sign({ id: user._id, rule: 'admin' }, JWT_SECRET, { expiresIn: '30m' });
    res.status(200).json({ status: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}


export async function validateUserByToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    const { user } = await AdminService.validateUserByTokenService(token);
    res.status(200).json({ status: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}



/**
 Retrieves an admin user by ID.
 It validates the user ID in the request params,
 calls the getUserById function from AdminService to fetch the user,
 and returns the user in the response.
 If the user is not found, it throws a NotFoundException.
 */
export async function getAdminUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await AdminService.getUserById(id);
    if (!user) {
      throw new NotFoundException("User not found.");
    }

    res.status(200).json({ status: true, data: user });
  } catch (err) {
    next(err);
  }
}

/**
Deletes an admin user by ID.
It validates the user ID in the request params,
calls the deleteUserById function from AdminService to delete the user,
and returns a success message in the response.
 */
export async function deleteAdminUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestException('User ID is required');
    }
    await AdminService.deleteUserById(id);
    res.status(200).json({ status: true, data: { message: "User successfully deleted" } });
  } catch (err) {
    next(err);
  }
}

/**
 Retrieves all admin users.
 It calls the getAllUsers function from AdminService to fetch all users,
 and returns the users in the response.
 Additionally, it modifies each user object to hide the actual password.
 */
export async function getAllAdminUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let users = await AdminService.getAllUsers();
    users = users.map(user => ({ ...user, password: "admin123" }));
    res.status(200).json({ status: true, data: users });
  } catch (err) {
    next(err);
  }
}

/**
 Marks an admin user as deleted.
 It validates the user ID in the request params,
 calls the markUserAsDeleted function from AdminService to update the user's deletion status,
 and returns a success message in the response.
 */
export async function markAdminUserAsDeleted(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestException('User ID is required');
    }
    await AdminService.markUserAsDeleted(id);
    res.status(200).json({ status: true, data: { message: "User deletion status successfully updated" } });
  } catch (err) {
    next(err);
  }
}

/**
 Retrieves a user from the provided token.
 It validates the authorization token from the request headers,
 verifies the token using the JWT_SECRET,
 calls the getUserById function from AdminService to fetch the user,
 and returns the user in the response.
 If the token is missing or invalid, it throws a ForbiddenException or UnauthorizedException.
 If the user is not found, it throws a NotFoundException.
 */
export async function getUserFromToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ForbiddenException("No token provided");
    }
    jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
      if (err) {
        throw new UnauthorizedException("Failed to authenticate token.");
      }
      const user = await AdminService.getUserById(decoded.id);
      if (!user) {
        throw new NotFoundException("No user found.");
      }
      res.status(200).json({ status: true, data: user });
    });
  } catch (err) {
    next(err);
  }
}

/**
 Adds a new admin user.
 It creates a new AdminModel instance using the request body,
 calls the createUser function from AdminService to save the user in the database,
 and returns the saved user in the response.
 If there is an uploaded file, it updates the user's image using
 the uploadImageToFirebaseAndUpdateUser function from AdminService.
 */
export async function addAdminUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const newUser = new AdminModel(req.body);
    let userInsertion = await AdminService.createUser(newUser);
    let savedUser = userInsertion.insertedId;
    console.log(savedUser);

    if (req.file) {
      const filePath = `adminimages/${userInsertion.insertedId}`;
      await AdminService.uploadImageToFirebaseAndUpdateUser(req.file, filePath, savedUser);
      savedUser = await AdminService.getUserById(savedUser); // Get updated user
    }

    res.status(201).json({ status: true, data: savedUser });
  } catch (err) {
    next(err);
  }
}

/**
 Updates the details of an admin user.
 It validates the user ID in the request params,
 checks the validity of the updated user details using the validateAdminUpdates function,
 calls the updateUserDetails function from AdminService to update the user details in the database,
 and returns the updated user in the response.
 If the updated user details are invalid, it throws a BadRequestException.
 */
export async function updateAdminUserDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userDetails = req.body;

    if (!validateAdminUpdates(userDetails)) {
      throw new BadRequestException("Invalid data to update.");
    }

    const updatedUser = await AdminService.updateUserDetails(id, userDetails, req.file);
    res.status(200).json({ status: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
}

