// src/resources/adminUsers/AdminController.ts


import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { bucket } from "../../firebase/storage";
import { JWT_SECRET } from "../../config/environment";
import { validateAdminUpdates } from "./AdminValidation";
import * as AdminService from './AdminService';
import AdminModel from "./AdminModel";


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

export async function updateAdminUserDetails(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const userDetails = req.body;
    if (!validateAdminUpdates(userDetails)){
      return res.status(401).json({ error: 'Invalid data to update.' });
    }
    const updatedUser = await AdminService.updateUserDetails(id, userDetails);
    return res.status(200).json([updatedUser,{ message: "User updated successfully" }]);
  } catch (error: any) {
      return res.status(500).json({ message: error.message });
  }
}

export async function getUserFromToken(req: Request, res: Response): Promise<Response> {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to authenticate token.' });
      }

      const user = await AdminService.getUserById(decoded.id);

      if (!user) {
        return res.status(404).json({ message: 'No user found.' });
      }

      return res.status(200).json(user);
    });
  } catch (error: any) {
    throw error;
  }
}

export async function addAdminUser(req: Request, res: Response): Promise<Response> {
  try {
    const newUser = new AdminModel(req.body);
    if(req.file) {
      // upload the file to Firebase Cloud Storage
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      const blobPromise = new Promise((resolve, reject) => {
        blobStream.on("error", (err) => {
          reject(err);
        });
        blobStream.on("finish", async () => {
          // Get URL of the uploaded file
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`;
          // Save the URL in user's photo_URL
          newUser.photo_URL = publicUrl;
          resolve(null);
        });
      });
      blobStream.end(req.file.buffer);
      await blobPromise;
      // Save the new user
      const savedUser = await AdminService.createUser(newUser);
      res.status(201).json(savedUser);
    } else {
      const savedUser = await AdminService.createUser(newUser);
      res.status(201).json(savedUser);
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}