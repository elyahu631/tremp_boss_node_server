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
  addNotificationToken,
  uploadUserImage
} from "./UserController";
import multerConfig from "../../config/multerConfig";

// multer middleware for file upload handling
const upload = multer(multerConfig); 
const usersRouter: Router = express.Router();

// for app users
usersRouter.post("/register", registerUser);// v
usersRouter.post("/login", loginUser);// v
usersRouter.get("/:id", authenticateToken, getUserById);// v
usersRouter.put("/markDeleted/:id", authenticateToken, markUserAsDeleted);
usersRouter.put("/update/:id", authenticateToken, updateUser);// V
usersRouter.post("/upload-image/:id", authenticateToken, upload.any(), uploadUserImage);

// for admin
usersRouter.get("/all", authenticateToken, getAllUsers);
usersRouter.post("/add", addUser);
usersRouter.delete("/delete/:id", authenticateToken, deleteUserById);
usersRouter.post("/admin-add-user",authenticateToken,upload.single('image_URL'),AdminAddUser);
usersRouter.put("/update-user/:id", authenticateToken, upload.single('image_URL'), updateUserDetails);

usersRouter.post("/add-notification-token", addNotificationToken);


usersRouter.use(handleErrors); 

export default usersRouter;
