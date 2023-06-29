// src/resources/users/UserRoutes.ts

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
} from "./UserController";

const router: Router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", authenticateToken, getUserById);
router.delete("/delete/:id", authenticateToken, deleteUserById);
router.put("/update/:id", authenticateToken, updateUser);
router.post("/add", addUser);
router.use(handleErrors); 

export default router;
