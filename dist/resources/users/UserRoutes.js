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
// multer middleware for file upload handling
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
});
const usersRouter = express_1.default.Router();
usersRouter.post("/register", UserController_1.registerUser);
usersRouter.post("/login", UserController_1.loginUser);
usersRouter.get("/all", auth_1.authenticateToken, UserController_1.getAllUsers);
usersRouter.get("/:id", auth_1.authenticateToken, UserController_1.getUserById);
usersRouter.delete("/delete/:id", auth_1.authenticateToken, UserController_1.deleteUserById);
usersRouter.put("/markDeleted/:id", auth_1.authenticateToken, UserController_1.markUserAsDeleted);
usersRouter.put("/update/:id", auth_1.authenticateToken, UserController_1.updateUser);
usersRouter.post("/add", UserController_1.addUser);
usersRouter.post("/admin-add-user", auth_1.authenticateToken, upload.single('photo_URL'), UserController_1.AdminAddUser);
usersRouter.use(handleErrors_1.handleErrors);
exports.default = usersRouter;
//# sourceMappingURL=UserRoutes.js.map