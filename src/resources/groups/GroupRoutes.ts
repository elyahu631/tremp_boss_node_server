import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import {
  getAllGroups,
  getGroupById,
  deleteGroupById,
  markGroupAsDeleted,
  addGroup,
  updateGroupDetails
} from "./GroupController";
import multer from "multer";
import multerConfig from "../../config/multerConfig";
import { handleErrors } from "../../middleware/handleErrors";

const upload = multer(multerConfig); 

const groupRoutes: Router = express.Router();

groupRoutes.get("/all", authenticateToken, getAllGroups);
groupRoutes.get("/getById/:id", authenticateToken, getGroupById);
groupRoutes.delete("/delete/:id", authenticateToken, deleteGroupById);
groupRoutes.put("/markDeleted/:id", authenticateToken, markGroupAsDeleted);
groupRoutes.post("/add-group", authenticateToken,upload.single('image_URL'), addGroup);
groupRoutes.put("/update-group/:id", authenticateToken,upload.single('image_URL'), updateGroupDetails);
// groupRoutes.post("/add-loction/:id", authenticateToken, addGroup);
// groupRoutes.post("/update-loction/:id", authenticateToken, addGroup);
groupRoutes.use(handleErrors); 



export default groupRoutes;
