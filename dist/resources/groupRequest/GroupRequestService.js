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
exports.approveOpenGroupRequest = exports.getUnapprovedRequests = exports.getUserRequests = exports.uploadGroupRequestImage = exports.addGroupRequest = void 0;
const mongodb_1 = require("mongodb");
const fileUpload_1 = require("../../firebase/fileUpload");
const HttpException_1 = require("../../middleware/HttpException");
const GroupRequestDataAccess_1 = __importDefault(require("./GroupRequestDataAccess"));
const UserDataAccess_1 = __importDefault(require("../users/UserDataAccess"));
const GroupDataAccess_1 = __importDefault(require("../groups/GroupDataAccess"));
const GroupModel_1 = __importDefault(require("../groups/GroupModel"));
const TimeService_1 = require("../../services/TimeService");
const UserGroupsModel_1 = __importDefault(require("../usersGroups/UserGroupsModel"));
const UserGroupsDataAccess_1 = __importDefault(require("../usersGroups/UserGroupsDataAccess"));
const sendNotification_1 = require("../../services/sendNotification");
const groupReqDataAccess = new GroupRequestDataAccess_1.default();
const groupDataAccess = new GroupDataAccess_1.default();
const userDataAccess = new UserDataAccess_1.default();
const userGroupsDataAccess = new UserGroupsDataAccess_1.default();
function addGroupRequest(groupReq) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if group with this name already exists
        const existingReqGroups = yield groupReqDataAccess.FindAllGroupReq({
            group_name: groupReq.group_name
        });
        const existingGroups = yield groupDataAccess.FindAllGroups({
            group_name: groupReq.group_name
        });
        if (existingReqGroups.length > 0 || existingGroups.length > 0) {
            throw new HttpException_1.BadRequestException("Group with this name already exists.");
        }
        return groupReqDataAccess.InsertOne(groupReq);
    });
}
exports.addGroupRequest = addGroupRequest;
function uploadGroupRequestImage(id, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = `grouprequest/${id}`;
        const image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        yield groupReqDataAccess.UpdateGroup(id, { image_URL });
        return image_URL;
    });
}
exports.uploadGroupRequestImage = uploadGroupRequestImage;
function getUserRequests(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return groupReqDataAccess.FindAllGroupReq({ user_id: new mongodb_1.ObjectId(userId) });
    });
}
exports.getUserRequests = getUserRequests;
// admin
function getUnapprovedRequests() {
    return __awaiter(this, void 0, void 0, function* () {
        const unapprovedRequests = yield groupReqDataAccess.FindAllGroupReq({ is_approved: { $in: ['pending', 'denied'] } });
        const populatedRequests = [];
        for (const request of unapprovedRequests) {
            const user = yield userDataAccess.FindById(request.user_id.toString());
            populatedRequests.push(Object.assign(Object.assign({}, request), { requester_name: user ? user.first_name + ' ' + user.last_name : 'Unknown User', requester_email: user ? user.email : 'Unknown Email' }));
        }
        return populatedRequests;
    });
}
exports.getUnapprovedRequests = getUnapprovedRequests;
//approveOpenGroupRequest
function approveOpenGroupRequest(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const groupRequest = yield findAndApproveGroupRequest(id);
        const newGroupId = yield createAndValidateNewGroup(groupRequest);
        const fcmToken = yield updateUserGroupMembership(groupRequest.user_id.toString(), newGroupId);
        yield createApprovedConnectionRequest(groupRequest.user_id.toString(), newGroupId);
        yield notifyUser(fcmToken, newGroupId, groupRequest.group_name);
    });
}
exports.approveOpenGroupRequest = approveOpenGroupRequest;
// Find and approve the group request
function findAndApproveGroupRequest(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const groupRequest = yield groupReqDataAccess.FindById(id);
        if (!groupRequest) {
            throw new HttpException_1.BadRequestException('Group Request not found');
        }
        yield groupReqDataAccess.UpdateGroup(id, { is_approved: 'approved' });
        return groupRequest;
    });
}
// Create and validate a new group
function createAndValidateNewGroup(groupRequest) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const newGroupData = {
            group_name: groupRequest.group_name,
            description: (_a = groupRequest.description) !== null && _a !== void 0 ? _a : '',
            type: groupRequest.type,
            image_URL: (_b = groupRequest.image_URL) !== null && _b !== void 0 ? _b : '',
            locations: groupRequest.locations,
            admins_ids: [groupRequest.user_id],
            active: 'active',
            deleted: false,
        };
        const newGroup = new GroupModel_1.default(newGroupData);
        newGroup.validateGroup();
        const res = yield groupDataAccess.InsertOne(newGroup);
        return res.insertedId;
    });
}
// Update the user's group membership
function updateUserGroupMembership(userId, newGroupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userDataAccess.FindById(userId);
        if (!user) {
            throw new HttpException_1.BadRequestException('User not found');
        }
        const updatedUserGroups = [...user.groups, new mongodb_1.ObjectId(newGroupId)];
        yield userDataAccess.Update(userId, { groups: updatedUserGroups });
        return user.notification_token;
    });
}
// Create approved connection request
function createApprovedConnectionRequest(userId, newGroupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const newConnectionRequestData = {
            user_id: new mongodb_1.ObjectId(userId),
            group_id: new mongodb_1.ObjectId(newGroupId),
            request_date: (0, TimeService_1.getCurrentTimeInIsrael)(),
            is_approved: 'approved'
        };
        const newConnectionRequest = new UserGroupsModel_1.default(newConnectionRequestData);
        newConnectionRequest.validateUserGroupReq();
        yield userGroupsDataAccess.InsertOne(newConnectionRequest);
    });
}
// Send notification to user
function notifyUser(fcmToken, newGroupId, groupName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fcmToken) {
            const notificationTitle = `Group Opened: ${groupName}`;
            const notificationBody = `The group "${groupName}" is now open and you have been added as an admin.`;
            yield (0, sendNotification_1.sendNotificationToUser)(fcmToken, notificationTitle, notificationBody, newGroupId.toString);
        }
        else {
            console.log('User does not have a valid FCM token');
        }
    });
}
//# sourceMappingURL=GroupRequestService.js.map