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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGroupRequest = exports.getUsersByGroup = exports.getGroupRequests = exports.approveRequest = void 0;
const UserGroupsService = __importStar(require("./UserGroupsService"));
// export async function requestJoinGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
//   try {
//     const userGroupReq = new UserGroupsModel(req.body);
//     const request = await UserGroupsService.requestToJoinGroup(userGroupReq);
//     res.status(201).json({ status: true, data: request });
//   } catch (error: any) {
//     next();
//   }
// }
function approveRequest(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { admin_id, req_id, is_approved } = req.body;
            yield UserGroupsService.approveGroupRequest(admin_id, req_id, is_approved);
            res.status(200).json({ status: true, message: "Request successfully approved" });
        }
        catch (error) {
            next();
        }
    });
}
exports.approveRequest = approveRequest;
function getGroupRequests(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { group_id } = req.body;
            const requests = yield UserGroupsService.getRequestsByGroupId(group_id);
            res.status(200).json({ status: true, Data: requests });
        }
        catch (error) {
            next();
        }
    });
}
exports.getGroupRequests = getGroupRequests;
function getUsersByGroup(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const groupId = req.body.group_id;
            const users = yield UserGroupsService.getUsersByGroupId(groupId);
            res.status(200).json({ status: true, users });
        }
        catch (error) {
            next();
        }
    });
}
exports.getUsersByGroup = getUsersByGroup;
function deleteGroupRequest(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_id, group_id } = req.body;
            yield UserGroupsService.deleteRequestByUserAndGroup(user_id, group_id);
            res.status(200).json({ status: true, message: "Request successfully deleted" });
        }
        catch (error) {
            next(error);
        }
    });
}
exports.deleteGroupRequest = deleteGroupRequest;
//# sourceMappingURL=UserGroupsController.js.map