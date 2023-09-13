// src/resources/users/UserRoutes.ts
import multer from "multer";
import express, { Router } from "express";
import { authenticateAdminToken, authenticateToken } from "../../middleware/auth";
import {handleErrors} from "../../middleware/handleErrors";

import {
  registerUser,
  loginUser,
  getUserById,
  deleteUserById,
  updateUser,
  getAllUsers,
  markUserAsDeleted,
  AdminAddUser,
  updateUserDetails,
  addNotificationToken,
  uploadUserImage,
  getUserGroups,
  verifyEmail,
  requestPasswordReset,
  resetPassword
} from "./UserController";
import multerConfig from "../../config/multerConfig";

// multer middleware for file upload handling
const upload = multer(multerConfig); 
const usersRouter: Router = express.Router();

usersRouter.get('/verify/:token', verifyEmail);

// for admin
usersRouter.get("/all", authenticateAdminToken, getAllUsers);
usersRouter.delete("/delete/:id", authenticateAdminToken, deleteUserById);
usersRouter.post("/admin-add-user",authenticateAdminToken,upload.single('image_URL'),AdminAddUser);
usersRouter.put("/update-user/:id", authenticateAdminToken, upload.single('image_URL'), updateUserDetails);

// for app users
usersRouter.post("/register", registerUser);
usersRouter.post("/login", loginUser);
usersRouter.post('/request-password-reset', requestPasswordReset);
usersRouter.post('/reset-password', resetPassword);
usersRouter.get("/:id", authenticateToken, getUserById);
usersRouter.put("/update/:id", authenticateToken, updateUser);
usersRouter.post("/update-image/:id", authenticateToken, upload.any(), uploadUserImage);
usersRouter.put("/mark-deleted/:id", authenticateToken, markUserAsDeleted);
usersRouter.post("/my-groups", authenticateToken, getUserGroups); 

usersRouter.post("/add-notification-token", addNotificationToken);


usersRouter.use(handleErrors); 

export default usersRouter;
