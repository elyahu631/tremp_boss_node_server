// src/resources/gifts/GiftsRouter.ts
import multer from "multer";
import express, { Router } from "express";
import { authenticateAdminToken, authenticateToken } from "../../middleware/auth";
import {handleErrors} from "../../middleware/handleErrors";
import multerConfig from "../../config/multerConfig"; 
import {
  getAllGifts,
  getGiftById,
  deleteGiftById,
  markGiftAsDeleted,
  addGift,
  updateGiftDetails
} from "./GiftController";
const upload = multer(multerConfig); 


const giftRoutes: Router = express.Router();

giftRoutes.get("/all", authenticateAdminToken, getAllGifts);
giftRoutes.get("/:id", authenticateAdminToken, getGiftById);
giftRoutes.delete("/delete/:id", authenticateAdminToken, deleteGiftById);
giftRoutes.put("/markDeleted/:id", authenticateAdminToken, markGiftAsDeleted);
giftRoutes.post("/add-gift", authenticateAdminToken, upload.single('image_URL'), addGift);
giftRoutes.put("/update-gift/:id", authenticateAdminToken, upload.single('image_URL'), updateGiftDetails);
giftRoutes.use(handleErrors); 

export default giftRoutes;
