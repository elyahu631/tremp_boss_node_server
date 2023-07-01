
import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import {handleErrors} from "../../middleware/handleErrors";

import {
  loginAdmin,
  getAdminUserById,
  deleteAdminUserById,
  addAdminUser,
  getAllAdminUsers,
} from "./AdminControler";

const adminRouter: Router = express.Router();

adminRouter.post("/login", loginAdmin);
adminRouter.get("/all", authenticateToken, getAllAdminUsers);
adminRouter.get("/:id",authenticateToken, getAdminUserById);
adminRouter.post("/add",authenticateToken, addAdminUser);
adminRouter.delete("/delete/:id", authenticateToken, deleteAdminUserById);

adminRouter.use(handleErrors); 

export default adminRouter;
