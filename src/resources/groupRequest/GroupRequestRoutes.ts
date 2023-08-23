import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import multer from "multer";
import multerConfig from "../../config/multerConfig";
import { handleErrors } from "../../middleware/handleErrors";
import { addGroupRequest, uploadGroupRequestImage } from "./GroupRequestController";

const upload = multer(multerConfig); 

const groupRequestRoutes: Router = express.Router();

groupRequestRoutes.post("/add", authenticateToken, addGroupRequest); 
groupRequestRoutes.post("/upload-image/:id", authenticateToken, upload.any(), uploadGroupRequestImage); // New route for uploading image




groupRequestRoutes.use(handleErrors); 



export default groupRequestRoutes;
