"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const multerConfig_1 = __importDefault(require("../../config/multerConfig"));
const handleErrors_1 = require("../../middleware/handleErrors");
const GroupRequestController_1 = require("./GroupRequestController");
const upload = (0, multer_1.default)(multerConfig_1.default);
const groupRequestRoutes = express_1.default.Router();
groupRequestRoutes.post("/add", auth_1.authenticateToken, GroupRequestController_1.addGroupRequest);
groupRequestRoutes.post("/upload-image/:id", auth_1.authenticateToken, upload.any(), GroupRequestController_1.uploadGroupRequestImage);
groupRequestRoutes.post("/get-user-requests", auth_1.authenticateToken, GroupRequestController_1.getUserRequests);
groupRequestRoutes.use(handleErrors_1.handleErrors);
exports.default = groupRequestRoutes;
//# sourceMappingURL=GroupRequestRoutes.js.map