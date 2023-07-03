"use strict";
// src/resources/adminUsers/AdminRouter.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const handleErrors_1 = require("../../middleware/handleErrors");
const AdminControler_1 = require("./AdminControler");
const adminRouter = express_1.default.Router();
adminRouter.post("/login", AdminControler_1.loginAdmin);
adminRouter.get("/all", auth_1.authenticateToken, AdminControler_1.getAllAdminUsers);
adminRouter.get("/:id", auth_1.authenticateToken, AdminControler_1.getAdminUserById);
adminRouter.post("/add", auth_1.authenticateToken, AdminControler_1.addAdminUser);
adminRouter.delete("/delete/:id", auth_1.authenticateToken, AdminControler_1.deleteAdminUserById);
adminRouter.put("/markDeleted/:id", auth_1.authenticateToken, AdminControler_1.markAdminUserAsDeleted);
adminRouter.put("/updateAdmin/:id", auth_1.authenticateToken, AdminControler_1.updateAdminUserDetails);
adminRouter.use(handleErrors_1.handleErrors);
exports.default = adminRouter;
//# sourceMappingURL=AdminRoutes.js.map