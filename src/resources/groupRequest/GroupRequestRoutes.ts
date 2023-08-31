import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import multer from "multer";
import multerConfig from "../../config/multerConfig";
import { handleErrors } from "../../middleware/handleErrors";
import { addGroupRequest, approveOpenGroupRequest,denyOpenGroupRequest, getUnapprovedRequests, getUserRequests, uploadGroupRequestImage } from "./GroupRequestController";

const upload = multer(multerConfig); 

const groupRequestRoutes: Router = express.Router();

groupRequestRoutes.post("/add", authenticateToken, addGroupRequest); 
groupRequestRoutes.post("/upload-image/:id", authenticateToken, upload.any(), uploadGroupRequestImage); 
groupRequestRoutes.post("/get-user-requests", authenticateToken, getUserRequests);


// admin 
groupRequestRoutes.get("/unapproved-requests", authenticateToken, getUnapprovedRequests);
groupRequestRoutes.put("/approve/:id", authenticateToken, approveOpenGroupRequest);
groupRequestRoutes.put("/deny/:id", authenticateToken, denyOpenGroupRequest);


groupRequestRoutes.use(handleErrors); 



export default groupRequestRoutes;
