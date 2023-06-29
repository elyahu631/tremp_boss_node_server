
import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import {handleErrors} from "../../middleware/handleErrors";

import {
  loginAdmin,
  getAdminUserById,
  deleteAdminUserById,
  addAdminUser,
} from "./AdminControler";

const adminRouter: Router = express.Router();

adminRouter.post("/login", loginAdmin);
adminRouter.get("/:id", getAdminUserById);
adminRouter.post("/add", addAdminUser);
adminRouter.delete("/delete/:id", authenticateToken, deleteAdminUserById);
adminRouter.use(handleErrors); 

export default adminRouter;
