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
} from "./UserController";
// multer middleware for file upload handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

const usersRouter: Router = express.Router();

usersRouter.post("/register", registerUser);
usersRouter.post("/login", loginUser);
usersRouter.get("/all", authenticateToken, getAllUsers);
usersRouter.get("/:id", authenticateToken, getUserById);
usersRouter.delete("/delete/:id", authenticateToken, deleteUserById);
usersRouter.put("/markDeleted/:id", authenticateToken, markUserAsDeleted);
usersRouter.put("/update/:id", authenticateToken, updateUser);
usersRouter.post("/add", addUser);
usersRouter.post("/admin-add-user",authenticateToken,upload.single('photo_URL'),AdminAddUser);

usersRouter.use(handleErrors); 

export default usersRouter;
