"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/resources/gifts/GiftsRouter.ts
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const multerConfig_1 = __importDefault(require("../../config/multerConfig"));
const GiftController_1 = require("./GiftController");
const upload = (0, multer_1.default)(multerConfig_1.default); // use the configuration from the separate file
const giftRoutes = express_1.default.Router();
giftRoutes.get("/all", auth_1.authenticateToken, GiftController_1.getAllGifts);
giftRoutes.get("/:id", auth_1.authenticateToken, GiftController_1.getGiftById);
giftRoutes.delete("/delete/:id", auth_1.authenticateToken, GiftController_1.deleteGiftById);
giftRoutes.put("/markDeleted/:id", auth_1.authenticateToken, GiftController_1.markGiftAsDeleted);
giftRoutes.post("/add-gift", auth_1.authenticateToken, upload.single('gift_image'), GiftController_1.addGift);
giftRoutes.put("/update-gift/:id", auth_1.authenticateToken, upload.single('gift_image'), GiftController_1.updateGiftDetails);
exports.default = giftRoutes;
//# sourceMappingURL=GiftRoutes.js.map