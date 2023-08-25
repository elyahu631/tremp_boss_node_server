"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/resources/userGroups/userGroupRouter.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const handleErrors_1 = require("../../middleware/handleErrors");
const UserGroupsController_1 = require("./UserGroupsController");
const userGroupsRoutes = express_1.default.Router();
userGroupsRoutes.delete("/cancel-group-request", auth_1.authenticateToken, UserGroupsController_1.deleteGroupRequest);
userGroupsRoutes.put("/approve-group-request", auth_1.authenticateToken, UserGroupsController_1.approveRequest);
userGroupsRoutes.post("/get-users-request", auth_1.authenticateToken, UserGroupsController_1.getUsersRequest);
userGroupsRoutes.use(handleErrors_1.handleErrors);
exports.default = userGroupsRoutes;
//# sourceMappingURL=UserGroupsRoutes.js.map