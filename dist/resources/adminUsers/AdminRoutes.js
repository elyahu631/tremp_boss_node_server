"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/resources/adminUsers/AdminRouter.ts
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const handleErrors_1 = require("../../middleware/handleErrors");
const AdminControler_1 = require("./AdminControler");
// src/resources/adminUsers/AdminRouter.ts
// multer middleware for file upload handling
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
});
// update routes to include file upload
const adminRouter = express_1.default.Router();
adminRouter.post("/login", AdminControler_1.loginAdmin);
adminRouter.get("/all", auth_1.authenticateToken, AdminControler_1.getAllAdminUsers);
adminRouter.get("/me", auth_1.authenticateToken, AdminControler_1.getUserFromToken);
adminRouter.get("/:id", auth_1.authenticateToken, AdminControler_1.getAdminUserById);
adminRouter.post("/add", auth_1.authenticateToken, upload.single('photo_URL'), AdminControler_1.addAdminUser);
adminRouter.delete("/delete/:id", auth_1.authenticateToken, AdminControler_1.deleteAdminUserById);
adminRouter.put("/markDeleted/:id", auth_1.authenticateToken, AdminControler_1.markAdminUserAsDeleted);
adminRouter.put("/updateAdmin/:id", auth_1.authenticateToken, AdminControler_1.updateAdminUserDetails);
adminRouter.use(handleErrors_1.handleErrors);
exports.default = adminRouter;
//# sourceMappingURL=AdminRoutes.js.map