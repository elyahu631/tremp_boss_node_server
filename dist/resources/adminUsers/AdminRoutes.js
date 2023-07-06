"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/resources/adminUsers/AdminRouter.ts
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const handleErrors_1 = require("../../middleware/handleErrors");
const AdminController_1 = require("./AdminController");
const AdminService_1 = require("./AdminService");
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
adminRouter.get('/stream', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        let users = yield (0, AdminService_1.getAllUsers)();
        users = users.map(user => (Object.assign(Object.assign({}, user), { password: "12345678" })));
        res.write(`data: ${JSON.stringify(users)}\n\n`);
    }), 15000); // send updates every 3 seconds
}));
adminRouter.post("/login", AdminController_1.loginAdmin);
adminRouter.get("/all", auth_1.authenticateToken, AdminController_1.getAllAdminUsers);
adminRouter.get("/me", auth_1.authenticateToken, AdminController_1.getUserFromToken);
adminRouter.get("/:id", auth_1.authenticateToken, AdminController_1.getAdminUserById);
adminRouter.post("/add", auth_1.authenticateToken, upload.single('photo_URL'), AdminController_1.addAdminUser);
adminRouter.delete("/delete/:id", auth_1.authenticateToken, AdminController_1.deleteAdminUserById);
adminRouter.put("/markDeleted/:id", auth_1.authenticateToken, AdminController_1.markAdminUserAsDeleted);
adminRouter.put("/updateAdmin/:id", auth_1.authenticateToken, upload.single('photo_URL'), AdminController_1.updateAdminUserDetails);
adminRouter.use(handleErrors_1.handleErrors);
exports.default = adminRouter;
//# sourceMappingURL=AdminRoutes.js.map