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
const upload = (0, multer_1.default)(multerConfig_1.default);
const openGroupRoutes = express_1.default.Router();
openGroupRoutes.post("/open-group-request", auth_1.authenticateToken, openGroupRequest);
// openGroupRoutes.get("/groups-user-connected/:user_id", authenticateToken, getConnectedGroups);
// openGroupRoutes.put("/join-group-request", authenticateToken, addGroupToUser);
openGroupRoutes.use(handleErrors_1.handleErrors);
exports.default = openGroupRoutes;
//# sourceMappingURL=OpenGroupsRoutes.js.map