// src/resources/adminUsers/AdminRouter.ts
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

const adminRouter: Router = express.Router();
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all", authenticateToken, getAllAdminUsers);
adminRouter.get("/me", authenticateToken, getUserFromToken);
adminRouter.get("/:id",authenticateToken, getAdminUserById);
adminRouter.post("/add", authenticateToken, upload.single('photo_URL'), addAdminUser);
adminRouter.delete("/delete/:id", authenticateToken, deleteAdminUserById);
adminRouter.put("/markDeleted/:id", authenticateToken, markAdminUserAsDeleted);
adminRouter.put("/updateAdmin/:id", authenticateToken, upload.single('photo_URL'), updateAdminUserDetails);

adminRouter.use(handleErrors); 

export default adminRouter;
