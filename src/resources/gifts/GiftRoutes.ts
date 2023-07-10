// src/resources/gifts/GiftsRouter.ts
import multer from "multer";
import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import multerConfig from "../../config/multerConfig"; 
import {
  getAllGifts,
  getGiftById,
  deleteGiftById,
  markGiftAsDeleted,
  addGift,
  updateGiftDetails
} from "./GiftController";
const upload = multer(multerConfig); // use the configuration from the separate file


const giftRoutes: Router = express.Router();

giftRoutes.get("/all", authenticateToken, getAllGifts);
giftRoutes.get("/:id", authenticateToken, getGiftById);
giftRoutes.delete("/delete/:id", authenticateToken, deleteGiftById);
giftRoutes.put("/markDeleted/:id", authenticateToken, markGiftAsDeleted);
giftRoutes.post("/add-gift", authenticateToken, upload.single('gift_image'), addGift);
giftRoutes.put("/update-gift/:id", authenticateToken, upload.single('gift_image'), updateGiftDetails);

export default giftRoutes;
