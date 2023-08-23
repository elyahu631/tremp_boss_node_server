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
exports.deleteRequestByUserAndGroup = exports.getUsersByGroupId = exports.getRequestsByGroupId = exports.approveGroupRequest = void 0;
const HttpException_1 = require("../../middleware/HttpException");
const GroupDataAccess_1 = __importDefault(require("../groups/GroupDataAccess"));
const UserDataAccess_1 = __importDefault(require("../users/UserDataAccess"));
const UserGroupsDataAccess_1 = __importDefault(require("./UserGroupsDataAccess"));
const mongodb_1 = require("mongodb");
const userGroupsDataAccess = new UserGroupsDataAccess_1.default();
const userDataAccess = new UserDataAccess_1.default();
const groupDataAccess = new GroupDataAccess_1.default();
// export async function requestToJoinGroup(userGroupReq: UserGroupsModel) {
//   return userGroupsDataAccess.InsertOne(userGroupReq);
// }
function assertUserHasGroups(user) {
    if (!user || !user.groups) {
        throw new HttpException_1.NotFoundException("User not found or user has no groups.");
    }
}
function approveGroupRequest(adminId, reqId, isApproved) {
    return __awaiter(this, void 0, void 0, function* () {
        const join_group_request = yield userGroupsDataAccess.FindById(adminId);
        const group = yield groupDataAccess.FindById((join_group_request.group_id).toString());
        // Check if group ID is valid
        if (!group || group.deleted) {
            throw new HttpException_1.NotFoundException("Group not found or deleted.");
        }
        if (!group.admin_ids.includes(new mongodb_1.ObjectId(adminId))) {
            throw new HttpException_1.UnauthorizedException("User not Unauthorized to approve users in group");
        }
        // Update the request status to the provided status
        const updateData = {
            is_approved: isApproved,
        };
        yield userGroupsDataAccess.UpdateUserGroups(reqId, updateData);
        const user = yield userDataAccess.FindById(join_group_request.user_id);
        assertUserHasGroups(user);
        user.groups.push(new mongodb_1.ObjectId(group._id));
        return yield userDataAccess.UpdateUserDetails((user._id).toString(), user);
    });
}
exports.approveGroupRequest = approveGroupRequest;
function getRequestsByGroupId(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield userGroupsDataAccess.FindAllUserGroups({
            group_id: new mongodb_1.ObjectId(groupId),
            is_approved: 'pending',
        });
    });
}
exports.getRequestsByGroupId = getRequestsByGroupId;
// export async function getUsersByGroupId(groupId: ObjectId) {
//   return userDataAccess.FindAllUsers({ groups: groupId }, { first_name: 1, last_name: 1 });
// }
function getUsersByGroupId(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const usersGroupReq = yield userGroupsDataAccess.FindAllUserGroups({ group_id: groupId }, { user_id: 1 });
        const userIds = usersGroupReq.map((req) => req.user_id);
        return userDataAccess.FindAllUsers({ _id: { $in: userIds } }, { first_name: 1, last_name: 1 });
    });
}
exports.getUsersByGroupId = getUsersByGroupId;
function deleteRequestByUserAndGroup(userId, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            user_id: new mongodb_1.ObjectId(userId),
            group_id: new mongodb_1.ObjectId(groupId),
        };
        const userGroupRequest = (yield userGroupsDataAccess.FindAllUserGroups(query))[0];
        if (!userGroupRequest) {
            throw new HttpException_1.NotFoundException("Request not found.");
        }
        if (userGroupRequest.is_approve !== "pending") {
            throw new HttpException_1.BadRequestException("Request can't be deleted.");
        }
        yield userGroupsDataAccess.DeleteById(userGroupRequest._id.toString());
    });
}
exports.deleteRequestByUserAndGroup = deleteRequestByUserAndGroup;
//# sourceMappingURL=UserGroupsService.js.map