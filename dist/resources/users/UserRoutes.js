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
const UserController_1 = require("./UserController");
const multerConfig_1 = __importDefault(require("../../config/multerConfig"));
// multer middleware for file upload handling
const upload = (0, multer_1.default)(multerConfig_1.default);
const usersRouter = express_1.default.Router();
// for app users
usersRouter.post("/register", UserController_1.registerUser); // v
usersRouter.post("/login", UserController_1.loginUser); // v
usersRouter.get("/:id", auth_1.authenticateToken, UserController_1.getUserById); // v
usersRouter.put("/markDeleted/:id", auth_1.authenticateToken, UserController_1.markUserAsDeleted);
usersRouter.put("/update/:id", auth_1.authenticateToken, UserController_1.updateUser); // V
usersRouter.post("/upload-image/:id", auth_1.authenticateToken, upload.any(), UserController_1.uploadUserImage);
// for admin
usersRouter.get("/all", auth_1.authenticateToken, UserController_1.getAllUsers);
usersRouter.post("/add", UserController_1.addUser);
usersRouter.delete("/delete/:id", auth_1.authenticateToken, UserController_1.deleteUserById);
usersRouter.post("/admin-add-user", auth_1.authenticateToken, upload.single('image_URL'), UserController_1.AdminAddUser);
usersRouter.put("/update-user/:id", auth_1.authenticateToken, upload.single('image_URL'), UserController_1.updateUserDetails);
usersRouter.post("/add-notification-token", UserController_1.addNotificationToken);
usersRouter.use(handleErrors_1.handleErrors);
exports.default = usersRouter;
//# sourceMappingURL=UserRoutes.js.map