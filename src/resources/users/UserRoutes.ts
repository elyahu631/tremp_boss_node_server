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
  getAllUsers,
  markUserAsDeleted,
  AdminAddUser,
  updateUserDetails,
  addNotificationToken,
  uploadUserImage,
  getUserGroups
} from "./UserController";
import multerConfig from "../../config/multerConfig";

// multer middleware for file upload handling
const upload = multer(multerConfig); 
const usersRouter: Router = express.Router();


// for admin
usersRouter.get("/all", authenticateToken, getAllUsers);
usersRouter.delete("/delete/:id", authenticateToken, deleteUserById);
usersRouter.post("/admin-add-user",authenticateToken,upload.single('image_URL'),AdminAddUser);
usersRouter.put("/update-user/:id", authenticateToken, upload.single('image_URL'), updateUserDetails);

// for app users
usersRouter.post("/register", registerUser);// V
usersRouter.post("/login", loginUser);// V
usersRouter.get("/:id", authenticateToken, getUserById);// V
usersRouter.put("/update/:id", authenticateToken, updateUser);// V
usersRouter.post("/update-image/:id", authenticateToken, upload.any(), uploadUserImage);// V
usersRouter.put("/mark-deleted/:id", authenticateToken, markUserAsDeleted);
usersRouter.post("/groups", authenticateToken, getUserGroups); 


usersRouter.post("/add-notification-token", addNotificationToken);


usersRouter.use(handleErrors); 

export default usersRouter;
