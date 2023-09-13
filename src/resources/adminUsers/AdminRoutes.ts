// src/resources/adminUsers/adminRoutes.ts
import multer from "multer";
import express, { Router } from "express";
import { authenticateAdminToken } from "../../middleware/auth";
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
  validateUserByToken,
} from "./AdminController";
import multerConfig from "../../config/multerConfig";

const upload = multer(multerConfig); 

const adminRoutes: Router = express.Router();
adminRoutes.post("/login", loginAdmin);
adminRoutes.get("/validateToken", authenticateAdminToken, validateUserByToken);
adminRoutes.get("/all", authenticateAdminToken, getAllAdminUsers);
adminRoutes.get("/me", authenticateAdminToken, getUserFromToken);
adminRoutes.get("/:id",authenticateAdminToken, getAdminUserById);
adminRoutes.post("/add", authenticateAdminToken, upload.single('image_URL'), addAdminUser);
adminRoutes.delete("/delete/:id", authenticateAdminToken, deleteAdminUserById);
adminRoutes.put("/markDeleted/:id", authenticateAdminToken, markAdminUserAsDeleted);
adminRoutes.put("/updateAdmin/:id", authenticateAdminToken, upload.single('image_URL'), updateAdminUserDetails);
adminRoutes.get("/validateToken", authenticateAdminToken, validateUserByToken);

adminRoutes.use(handleErrors); 

export default adminRoutes;
