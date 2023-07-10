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

// multer middleware for file upload handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

const adminRoutes: Router = express.Router();
adminRoutes.post("/login", loginAdmin);
adminRoutes.get("/all", authenticateToken, getAllAdminUsers);
adminRoutes.get("/me", authenticateToken, getUserFromToken);
adminRoutes.get("/:id",authenticateToken, getAdminUserById);
adminRoutes.post("/add", authenticateToken, upload.single('photo_URL'), addAdminUser);
adminRoutes.delete("/delete/:id", authenticateToken, deleteAdminUserById);
adminRoutes.put("/markDeleted/:id", authenticateToken, markAdminUserAsDeleted);
adminRoutes.put("/updateAdmin/:id", authenticateToken, upload.single('photo_URL'), updateAdminUserDetails);

adminRoutes.use(handleErrors); 

export default adminRoutes;
