// src/resources/adminUsers/AdminController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/environment";

import * as AdminService from './AdminService';
import AdminModel from "./AdminModel";
// import { validateUpdatedUser } from "./AdminValidation";



export async function loginAdmin(req: Request, res: Response): Promise<Response> {
  const { username, password } = req.body;
  const user = await AdminService.loginUser(username, password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  return res.status(200).json({ user, token });
}


export async function getAdminUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const user = await AdminService.getUserById(id);
    return res.status(200).json(user);
  } catch (error: any) {
    throw error;
  }
}

export async function deleteAdminUserById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    await AdminService.deleteUserById(id);
    return res.status(200).json({ message: "User successfully deleted" });
  } catch (error: any) {
    throw error;
  }
}

export async function addAdminUser(req: Request, res: Response): Promise<Response> {
  try {
    const newUser = await AdminService.createUser(new AdminModel(req.body));
    return res.status(201).json(newUser);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


export async function getAllAdminUsers(req: Request, res: Response): Promise<Response> {
  try {
    const users = await AdminService.getAllUsers();
    return res.status(200).json(users);
  } catch (error: any) {
    throw error;
  }
}

export async function markAdminUserAsDeleted(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    await AdminService.markUserAsDeleted(id);
    return res.status(200).json({ message: "User deletion status successfully updated" });
  } catch (error: any) {
    throw error;
  }
}
