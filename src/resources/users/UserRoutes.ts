// src/resources/users/UserRoutes.ts
import multer from "multer";
import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import {handleErrors} from "../../middleware/handleErrors";

import {
  registerUser,
  loginUser,
  getUserById,
  deleteUserById,
  updateUser,
  addUser,
  getAllUsers,
  markUserAsDeleted,
  AdminAddUser,
  updateUserDetails,
} from "./UserController";
import multerConfig from "../../config/multerConfig";
// multer middleware for file upload handling
const upload = multer(multerConfig); 
const usersRouter: Router = express.Router();

usersRouter.post("/register", registerUser);
usersRouter.post("/login", loginUser);
usersRouter.get("/all", authenticateToken, getAllUsers);
usersRouter.get("/:id", authenticateToken, getUserById);
usersRouter.delete("/delete/:id", authenticateToken, deleteUserById);
usersRouter.put("/markDeleted/:id", authenticateToken, markUserAsDeleted);
usersRouter.put("/update/:id", authenticateToken, updateUser);
usersRouter.post("/add", addUser);
usersRouter.post("/admin-add-user",authenticateToken,upload.single('image_URL'),AdminAddUser);
usersRouter.put("/update-user/:id", authenticateToken, upload.single('image_URL'), updateUserDetails);
// usersRouter.put("/update-user-image/:id", authenticateToken, upload.single('image_URL'), updateUserImage);

// usersRouter.post("/add-notification-token", addNotificationToken);

usersRouter.use(handleErrors); 

export default usersRouter;
