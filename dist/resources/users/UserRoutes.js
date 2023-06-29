"use strict";
// src/resources/users/UserRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const handleErrors_1 = require("../../middleware/handleErrors");
const UserController_1 = require("./UserController");
const router = express_1.default.Router();
router.post("/register", UserController_1.registerUser);
router.post("/login", UserController_1.loginUser);
router.get("/:id", auth_1.authenticateToken, UserController_1.getUserById);
router.delete("/delete/:id", auth_1.authenticateToken, UserController_1.deleteUserById);
router.put("/update/:id", auth_1.authenticateToken, UserController_1.updateUser);
router.post("/add", UserController_1.addUser);
router.use(handleErrors_1.handleErrors);
exports.default = router;
//# sourceMappingURL=UserRoutes.js.map