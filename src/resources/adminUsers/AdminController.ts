// src/resources/adminUsers/AdminController.ts

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/environment";
import { validateAdminUpdates } from "./AdminValidation";
import * as AdminService from "./AdminService";
import AdminModel from "./AdminModel";
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "../../middleware/HttpException";

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

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "8h" });
    res.status(200).json({ status: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}

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

export async function getAllAdminUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let users = await AdminService.getAllUsers();
    users = users.map(user => ({ ...user, password: "admin123" }));
    res.status(200).json({ status: true, data: users });
  } catch (err) {
    next(err);
  }
}

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

