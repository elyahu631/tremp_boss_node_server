"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TrempController = __importStar(require("./TrempController"));
const handleErrors_1 = require("../../middleware/handleErrors");
const auth_1 = require("../../middleware/auth");
const trempRoutes = express_1.default.Router();
trempRoutes.post("/add", auth_1.authenticateToken, TrempController.createTremp);
trempRoutes.post('/tremps-by-filters', auth_1.authenticateToken, TrempController.getTrempsByFilters);
trempRoutes.put('/join-ride', auth_1.authenticateToken, TrempController.addUserToTremp);
trempRoutes.post("/user-tremps", auth_1.authenticateToken, TrempController.getUserTremps);
trempRoutes.put('/approve-user-in-tremp', auth_1.authenticateToken, TrempController.approveUserInTremp);
trempRoutes.get('/users-in-tremp/:tremp_id', auth_1.authenticateToken, TrempController.getUsersInTremp);
trempRoutes.post('/approved-tremps', auth_1.authenticateToken, TrempController.getApprovedTremps);
trempRoutes.delete('/delete-tremp', auth_1.authenticateToken, TrempController.deleteTremp);
//for admin
trempRoutes.get("/all", auth_1.authenticateToken, TrempController.getAllTremps);
trempRoutes.use(handleErrors_1.handleErrors);
exports.default = trempRoutes;
//# sourceMappingURL=TrempRoutes.js.map