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
import { getAllUsers } from "./AdminService";
// src/resources/adminUsers/AdminRouter.ts

// multer middleware for file upload handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

// update routes to include file upload


const adminRouter: Router = express.Router();
adminRouter.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  setInterval(async () => {
    let users = await getAllUsers();
    users = users.map(user => ({...user, password: "12345678"}));
    res.write(`data: ${JSON.stringify(users)}\n\n`);
  }, 15000); // send updates every 3 seconds
});

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
