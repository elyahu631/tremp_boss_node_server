"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/resources/adminUsers/adminRoutes.ts
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const handleErrors_1 = require("../../middleware/handleErrors");
const AdminController_1 = require("./AdminController");
const multerConfig_1 = __importDefault(require("../../config/multerConfig"));
const upload = (0, multer_1.default)(multerConfig_1.default);
const adminRoutes = express_1.default.Router();
adminRoutes.post("/login", AdminController_1.loginAdmin);
adminRoutes.get("/all", auth_1.authenticateToken, AdminController_1.getAllAdminUsers);
adminRoutes.get("/me", auth_1.authenticateToken, AdminController_1.getUserFromToken);
adminRoutes.get("/:id", auth_1.authenticateToken, AdminController_1.getAdminUserById);
adminRoutes.post("/add", auth_1.authenticateToken, upload.single('photo_URL'), AdminController_1.addAdminUser);
adminRoutes.delete("/delete/:id", auth_1.authenticateToken, AdminController_1.deleteAdminUserById);
adminRoutes.put("/markDeleted/:id", auth_1.authenticateToken, AdminController_1.markAdminUserAsDeleted);
adminRoutes.put("/updateAdmin/:id", auth_1.authenticateToken, upload.single('photo_URL'), AdminController_1.updateAdminUserDetails);
adminRoutes.use(handleErrors_1.handleErrors);
exports.default = adminRoutes;
//# sourceMappingURL=AdminRoutes.js.map