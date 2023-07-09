// src/resources/users/UserController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/environment";
import * as UserService from './UserService';
import { validateUpdatedUser } from "./UserValidation";
import UserModel from "./UserModel";

export async function registerUser(req: Request, res: Response): Promise<Response> {
  try {
    const { user_email, password } = req.body;
    const result = await UserService.registerUser(user_email, password);
    if (!result) {
      return res.status(500).json({ message: "Failed to register user" });
    }
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    throw error;
  }
}

export async function loginUser(req: Request, res: Response): Promise<Response> {
  const { user_email, password } = req.body;
  const user = await UserService.loginUser(user_email, password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '6h' });
  return res.status(200).json({ user, token });
}

export async function getUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    return res.status(200).json(user);
  } catch (error: any) {
    throw error;
  }
}

export async function deleteUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    await UserService.deleteUserById(id);
    return res.status(200).json({ message: "User successfully deleted" });
  } catch (error: any) {
    throw error;
  }
}

export async function updateUser(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const updatedUser = req.body;
    if (!validateUpdatedUser(updatedUser)){
        return res.status(401).json({ error: 'Invalid data to update.' });
    }
    await UserService.updateUser(id, updatedUser);
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error: any) {
   
  }
}

export async function addUser(req: Request, res: Response): Promise<Response> {
  try {
    const { user_email, password } = req.body;
    const result = await UserService.addUser(user_email, password);
    return res.status(201).json(result);
  } catch (error: any) {
    throw error;
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<Response> {
  try {
    const users = await UserService.getAllUsers();
    return res.status(200).json(users);
  } catch (error: any) {
    throw error;
  }
}

export async function markUserAsDeleted(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    await UserService.markUserAsDeleted(id);
    return res
      .status(200)
      .json({ message: "User deletion status successfully updated" });
  } catch (error: any) {
    throw error;
  }
}


export async function AdminAddUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {    
    const newUser = new UserModel(req.body);
    let userInsertion = await UserService.createUser(newUser);
    let savedUser = userInsertion.insertedId;
    if (req.file) {
      const filePath = `usersimages/${userInsertion.insertedId}`;
      await UserService.uploadImageToFirebaseAndUpdateUser(req.file, filePath, savedUser);
      savedUser = await UserService.getUserById(savedUser); // Get updated user
    }
    return res.status(201).json(savedUser);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

