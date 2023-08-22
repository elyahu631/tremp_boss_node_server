"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/resources/users/UserRoutes.ts
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const handleErrors_1 = require("../../middleware/handleErrors");
const multerConfig_1 = __importDefault(require("../../config/multerConfig"));
// multer middleware for file upload handling
const upload = (0, multer_1.default)(multerConfig_1.default);
const usersRouter = express_1.default.Router();
// for app users
usersRouter.post("/register", registerUser); // V
usersRouter.post("/login", loginUser); // V
usersRouter.get("/:id", auth_1.authenticateToken, getUserById); // V
usersRouter.put("/update/:id", auth_1.authenticateToken, updateUser); // V
usersRouter.post("/update-image/:id", auth_1.authenticateToken, upload.any(), uploadUserImage); // V
usersRouter.put("/mark-deleted/:id", auth_1.authenticateToken, markUserAsDeleted);
// for admin
usersRouter.get("/all", auth_1.authenticateToken, getAllUsers);
usersRouter.delete("/delete/:id", auth_1.authenticateToken, deleteUserById);
usersRouter.post("/admin-add-user", auth_1.authenticateToken, upload.single('image_URL'), AdminAddUser);
usersRouter.put("/update-user/:id", auth_1.authenticateToken, upload.single('image_URL'), updateUserDetails);
usersRouter.post("/add-notification-token", addNotificationToken);
usersRouter.use(handleErrors_1.handleErrors);
exports.default = usersRouter;
//# sourceMappingURL=UserGroupsRoutes.js.map