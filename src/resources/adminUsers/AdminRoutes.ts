// src/resources/adminUsers/adminRoutes.ts
import multer from "multer";
import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import {handleErrors} from "../../middleware/handleErrors";

import {
  loginAdmin,
  getAdminUserById,
  deleteAdminUserById,
  addAdminUser,
  getAllAdminUsers,
  markAdminUserAsDeleted,
  updateAdminUserDetails,
  getUserFromToken,
} from "./AdminController";
import multerConfig from "../../config/multerConfig";

const upload = multer(multerConfig); 

const adminRoutes: Router = express.Router();
adminRoutes.post("/login", loginAdmin);
adminRoutes.get("/all", authenticateToken, getAllAdminUsers);
adminRoutes.get("/me", authenticateToken, getUserFromToken);
adminRoutes.get("/:id",authenticateToken, getAdminUserById);
adminRoutes.post("/add", authenticateToken, upload.single('image_URL'), addAdminUser);
adminRoutes.delete("/delete/:id", authenticateToken, deleteAdminUserById);
adminRoutes.put("/markDeleted/:id", authenticateToken, markAdminUserAsDeleted);
adminRoutes.put("/updateAdmin/:id", authenticateToken, upload.single('image_URL'), updateAdminUserDetails);

adminRoutes.use(handleErrors); 

export default adminRoutes;
