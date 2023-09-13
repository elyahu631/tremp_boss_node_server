import { authenticateAdminToken } from './../../middleware/auth';
import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import {
  getAllGroups,
  getGroupById,
  deleteGroupById,
  markGroupAsDeleted,
  addGroup,
  updateGroupDetails,
  getGroupsUserNotConnected,
  getConnectedGroups,
  addGroupToUser,
  removeGroupFromUser,
  addAdminToGroup,
  allGroupsWithUserStatus,
  updateGroup,
  uploadGroupImage
} from "./GroupController";
import multer from "multer";
import multerConfig from "../../config/multerConfig";
import { handleErrors } from "../../middleware/handleErrors";

const upload = multer(multerConfig); 

const groupRoutes: Router = express.Router();

groupRoutes.get("/getById/:id", authenticateToken, getGroupById);
groupRoutes.post("/groups-user-not-connected", authenticateToken, getGroupsUserNotConnected); // הצגת כל הקבוצות שהוא לא התחבר אליהן
groupRoutes.get("/groups-user-connected/:user_id", authenticateToken, getConnectedGroups);
groupRoutes.put("/join-group-request", authenticateToken, addGroupToUser);
groupRoutes.put("/disconnect-from-group", authenticateToken, removeGroupFromUser);
groupRoutes.put("/add-admin-to-group", authenticateToken, addAdminToGroup);
groupRoutes.post("/all-groups-with-user-status", authenticateToken, allGroupsWithUserStatus);
groupRoutes.put("/update", authenticateToken, updateGroup);
groupRoutes.post("/upload-image/:id", authenticateToken, upload.any(), uploadGroupImage); 


// admin
groupRoutes.get("/all", authenticateAdminToken, getAllGroups);
groupRoutes.delete("/delete/:id", authenticateAdminToken, deleteGroupById);
groupRoutes.put("/markDeleted/:id", authenticateAdminToken, markGroupAsDeleted);
groupRoutes.post("/add-group", authenticateAdminToken,upload.single('image_URL'), addGroup);
groupRoutes.put("/update-group/:id", authenticateAdminToken,upload.single('image_URL'), updateGroupDetails);
// groupRoutes.post("/add-loction/:id", authenticateToken, addGroup);
// groupRoutes.post("/update-loction/:id", authenticateToken, addGroup);
groupRoutes.use(handleErrors); 



export default groupRoutes;
