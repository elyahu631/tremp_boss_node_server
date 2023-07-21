// src/resources/gifts/GiftsRouter.ts
import multer from "multer";
import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
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

giftRoutes.get("/all", authenticateToken, getAllGifts);
giftRoutes.get("/:id", authenticateToken, getGiftById);
giftRoutes.delete("/delete/:id", authenticateToken, deleteGiftById);
giftRoutes.put("/markDeleted/:id", authenticateToken, markGiftAsDeleted);
giftRoutes.post("/add-gift", authenticateToken, upload.single('image_URL'), addGift);
giftRoutes.put("/update-gift/:id", authenticateToken, upload.single('image_URL'), updateGiftDetails);
giftRoutes.use(handleErrors); 

export default giftRoutes;
