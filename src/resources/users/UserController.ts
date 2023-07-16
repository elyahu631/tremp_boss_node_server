// src/resources/users/UserController.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/environment";
import * as UserService from './UserService';
import { validateUpdatedUser } from "./UserValidation";
import UserModel from "./UserModel";
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "../../middleware/HttpException";

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

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    res.status(200).json({ status: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await UserService.deleteUserById(id);
    res.status(200).json({ status: true, message: "User successfully deleted" });
  } catch (err) {
    next(err);
  }
}

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

export async function addUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_email, password } = req.body;
    const result = await UserService.addUser(user_email, password);
    res.status(201).json({ status: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let users = await UserService.getAllUsers();
    users = users.map(user => ({ ...user, password: "user1234" }));
    res.status(200).json({ status: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function markUserAsDeleted(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await UserService.markUserAsDeleted(id);
    res.status(200).json({ status: true, message: "User deletion status successfully updated" });
  } catch (err) {
    next(err);
  }
}

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
