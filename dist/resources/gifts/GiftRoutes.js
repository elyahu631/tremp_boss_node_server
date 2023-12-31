"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/resources/gifts/GiftsRouter.ts
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const handleErrors_1 = require("../../middleware/handleErrors");
const multerConfig_1 = __importDefault(require("../../config/multerConfig"));
const GiftController_1 = require("./GiftController");
const upload = (0, multer_1.default)(multerConfig_1.default);
const giftRoutes = express_1.default.Router();
giftRoutes.get("/all", auth_1.authenticateAdminToken, GiftController_1.getAllGifts);
giftRoutes.get("/:id", auth_1.authenticateAdminToken, GiftController_1.getGiftById);
giftRoutes.delete("/delete/:id", auth_1.authenticateAdminToken, GiftController_1.deleteGiftById);
giftRoutes.put("/markDeleted/:id", auth_1.authenticateAdminToken, GiftController_1.markGiftAsDeleted);
giftRoutes.post("/add-gift", auth_1.authenticateAdminToken, upload.single('image_URL'), GiftController_1.addGift);
giftRoutes.put("/update-gift/:id", auth_1.authenticateAdminToken, upload.single('image_URL'), GiftController_1.updateGiftDetails);
giftRoutes.use(handleErrors_1.handleErrors);
exports.default = giftRoutes;
//# sourceMappingURL=GiftRoutes.js.map