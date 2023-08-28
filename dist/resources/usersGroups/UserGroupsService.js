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
exports.getUsersRequest = exports.approveGroupRequest = exports.deleteRequestByUserAndGroup = void 0;
const HttpException_1 = require("../../middleware/HttpException");
const GroupDataAccess_1 = __importDefault(require("../groups/GroupDataAccess"));
const UserDataAccess_1 = __importDefault(require("../users/UserDataAccess"));
const UserGroupsDataAccess_1 = __importDefault(require("./UserGroupsDataAccess"));
const mongodb_1 = require("mongodb");
const userGroupsDataAccess = new UserGroupsDataAccess_1.default();
const userDataAccess = new UserDataAccess_1.default();
const groupDataAccess = new GroupDataAccess_1.default();
function assertUserHasGroups(user) {
    if (!user || !user.groups) {
        throw new HttpException_1.NotFoundException("User not found or user has no groups.");
    }
}
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
function approveGroupRequest(adminId, reqId, isApproved) {
    return __awaiter(this, void 0, void 0, function* () {
        const join_group_request = yield userGroupsDataAccess.FindById(reqId);
        const group = yield groupDataAccess.FindById((join_group_request.group_id).toString());
        // Check if group ID is valid
        if (!group || group.deleted) {
            throw new HttpException_1.NotFoundException("Group not found");
        }
        const stringAdminIds = group.admins_ids.map((id) => id.toString());
        if (!stringAdminIds.includes(adminId)) {
            throw new HttpException_1.UnauthorizedException("User not Unauthorized to approve users in group");
        }
        if (isApproved !== 'approved' && isApproved !== 'denied') {
            throw new HttpException_1.BadRequestException("Invalid status value");
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
function getUsersRequest(userId, groupId, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            group_id: new mongodb_1.ObjectId(groupId),
            is_approved: status,
        };
        const usersGroupReq = yield userGroupsDataAccess.FindAllUserGroups(query);
        // Retrieve the group details to get the list of admin IDs
        const groupDetails = yield groupDataAccess.FindById(groupId);
        // Map the user group requests to the desired format
        const usersWithRequests = usersGroupReq.map((req) => __awaiter(this, void 0, void 0, function* () {
            const user = yield userDataAccess.FindById(req.user_id);
            let isAdmin = false;
            if (status === 'approved') {
                isAdmin = groupDetails.admins_ids.some((adminId) => adminId.toString() === req.user_id.toString());
            }
            return {
                request: Object.assign(Object.assign({}, req), { user: Object.assign({ first_name: user.first_name, last_name: user.last_name, email: user.email, phone_number: user.phone_number, image_URL: user.image_URL, gender: user.gender }, (status === 'approved' && { is_admin: isAdmin })) }),
            };
        }));
        // Wait for all promises to complete and return the result
        return yield Promise.all(usersWithRequests);
    });
}
exports.getUsersRequest = getUsersRequest;
//# sourceMappingURL=UserGroupsService.js.map