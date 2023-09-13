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
exports.uploadImageToFirebaseAndUpdateGroup = exports.updateGroupDetails = exports.addGroup = exports.markGroupAsDeleted = exports.deleteGroupById = exports.getAllGroups = exports.uploadGroupImage = exports.updateGroup = exports.addAdminToGroup = exports.removeGroupFromUser = exports.addGroupToUser = exports.getConnectedGroups = exports.allGroupsWithUserStatus = exports.getGroupsUserNotConnected = exports.getGroupById = void 0;
const GroupDataAccess_1 = __importDefault(require("./GroupDataAccess"));
const GroupModel_1 = __importDefault(require("./GroupModel"));
const mongodb_1 = require("mongodb");
const fileUpload_1 = require("../../firebase/fileUpload");
const HttpException_1 = require("../../middleware/HttpException");
const mongodb_2 = require("mongodb");
const UserDataAccess_1 = __importDefault(require("../users/UserDataAccess"));
const UserGroupsDataAccess_1 = __importDefault(require("../usersGroups/UserGroupsDataAccess"));
const UserGroupsModel_1 = __importDefault(require("../usersGroups/UserGroupsModel"));
const TimeService_1 = require("../../services/TimeService");
const groupDataAccess = new GroupDataAccess_1.default();
const userDataAccess = new UserDataAccess_1.default();
const userGroupsDataAccess = new UserGroupsDataAccess_1.default();
function getGroupById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return groupDataAccess.FindById(id);
    });
}
exports.getGroupById = getGroupById;
///////
function assertUserHasGroups(user) {
    if (!user || !user.groups) {
        throw new HttpException_1.NotFoundException("User not found or user has no groups.");
    }
}
function getGroupsUserNotConnected(userId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userDataAccess.FindById(userId);
        assertUserHasGroups(user);
        // Create an array of ObjectIds for the user's connected groups
        const userConnectedGroupIds = user.groups.map((group) => new mongodb_1.ObjectId(group));
        const query = {
            _id: { $nin: userConnectedGroupIds },
            type: type,
            deleted: false,
        };
        const groups = yield groupDataAccess.FindAllGroups(query);
        return groups;
    });
}
exports.getGroupsUserNotConnected = getGroupsUserNotConnected;
// all Groups With User Status
function allGroupsWithUserStatus(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userDataAccess.FindById(userId);
        assertUserHasGroups(user);
        const userIdAsObj = new mongodb_1.ObjectId(userId);
        const connectedGroups = yield findUserGroups(userIdAsObj, 'approved');
        const pendingGroups = yield findUserGroups(userIdAsObj, 'pending');
        const allGroups = yield groupDataAccess.FindAllGroups({ type: 'PRIVATE' }, { group_name: 1, type: 1, image_URL: 1, locations: 1, admins_ids: 1, amount_of_users: 1 });
        const connectedGroupsDetails = yield getDetailedGroups(connectedGroups, connectedGroups);
        const pendingGroupsDetails = yield getDetailedGroups(pendingGroups, connectedGroups);
        const notJoinGroups = yield getNotJoinGroups(allGroups, connectedGroups, pendingGroups);
        const addCountOfUsers = (group) => __awaiter(this, void 0, void 0, function* () {
            group.amount_of_users = yield userGroupsDataAccess.CountUsersInGroup(new mongodb_1.ObjectId(group._id));
        });
        // Add the user count to each group
        yield Promise.all(connectedGroupsDetails.map(addCountOfUsers));
        yield Promise.all(pendingGroupsDetails.map(addCountOfUsers));
        yield Promise.all(notJoinGroups.map(addCountOfUsers));
        // Add is_admin field and remove admins_ids
        connectedGroupsDetails.map(group => addIsAdminField(group, userId));
        pendingGroupsDetails.map(group => addIsAdminField(group, userId));
        notJoinGroups.map(group => addIsAdminField(group, userId));
        return {
            approved: connectedGroupsDetails,
            pending: pendingGroupsDetails,
            not_join: notJoinGroups,
        };
    });
}
exports.allGroupsWithUserStatus = allGroupsWithUserStatus;
function findUserGroups(userIdAsObj, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const groups = yield userGroupsDataAccess.FindAllUserGroups({ user_id: userIdAsObj, is_approved: status }, { group_id: 1 });
        return groups.map(group => group.group_id.toString());
    });
}
function getGroupDetailsWithUsersCount(groupId, connectedGroups) {
    return __awaiter(this, void 0, void 0, function* () {
        const group = yield groupDataAccess.FindById(groupId, { group_name: 1, type: 1, image_URL: 1, locations: 1, admins_ids: 1, amount_of_users: 1 });
        group.amount_of_users = connectedGroups.filter(cg => cg === groupId).length;
        return group;
    });
}
function getDetailedGroups(groupIds, connectedGroups) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.all(groupIds.map(groupId => getGroupDetailsWithUsersCount(groupId, connectedGroups)));
    });
}
function getNotJoinGroups(allGroups, connectedGroups, pendingGroups) {
    return __awaiter(this, void 0, void 0, function* () {
        return allGroups.filter(group => {
            return !connectedGroups.some(cg => cg === group._id.toString()) &&
                !pendingGroups.some(pg => pg === group._id.toString());
        });
    });
}
function addIsAdminField(group, userId) {
    // Convert admins_ids ObjectIds to strings
    const adminIds = group.admins_ids.map((id) => id.toString());
    // Check for inclusion using the string representation
    group.is_admin = adminIds.includes(userId.toString());
    delete group.admins_ids;
    return group;
}
function getConnectedGroups(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userDataAccess.FindById(userId);
        assertUserHasGroups(user);
        const userConnectedGroupIds = user.groups.map((group) => new mongodb_1.ObjectId(group));
        const qeury = { _id: { $in: userConnectedGroupIds } };
        const groups = yield groupDataAccess.FindAllGroups(qeury);
        return groups;
    });
}
exports.getConnectedGroups = getConnectedGroups;
function addGroupToUser(userId, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userDataAccess.FindById(userId);
        assertUserHasGroups(user);
        // is group ID is valid
        const groupToAdd = yield groupDataAccess.FindById(groupId);
        if (!groupToAdd || groupToAdd.deleted) {
            throw new HttpException_1.NotFoundException("Group not found or deleted.");
        }
        // group is already connected to the user
        if (user.groups.some((group) => group.toString() === groupId)) {
            throw new HttpException_1.BadRequestException("Group already connected to the user.");
        }
        const query = { user_id: new mongodb_1.ObjectId(userId), group_id: new mongodb_1.ObjectId(groupId) };
        const userGroupReq = new UserGroupsModel_1.default(query);
        const request = yield userGroupsDataAccess.FindAllUserGroups(query);
        if (request.length > 0) {
            throw new HttpException_1.BadRequestException("You have already requested to join.");
        }
        yield userGroupsDataAccess.InsertOne(userGroupReq);
        return `Your request to join ${groupToAdd.group_name} has been successfully sent.`;
    });
}
exports.addGroupToUser = addGroupToUser;
function removeGroupFromUser(userId, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userDataAccess.FindById(userId);
        assertUserHasGroups(user);
        // Check if group ID is valid
        const groupToRemove = yield groupDataAccess.FindById(groupId);
        if (!groupToRemove || groupToRemove.deleted) {
            throw new HttpException_1.NotFoundException("Group not found or deleted.");
        }
        // Check if group is connected to the user
        const groupIndex = user.groups.findIndex((group) => group.toString() === groupId);
        if (groupIndex === -1) {
            throw new HttpException_1.BadRequestException("Group not connected to the user.");
        }
        // Remove the group from the user's groups
        user.groups.splice(groupIndex, 1);
        yield userDataAccess.UpdateUserDetails(user._id.toString(), user);
        const query = {
            user_id: new mongodb_1.ObjectId(userId),
            group_id: new mongodb_1.ObjectId(groupId),
        };
        const userGroupRequest = (yield userGroupsDataAccess.FindAllUserGroups(query))[0];
        if (!userGroupRequest) {
            throw new HttpException_1.NotFoundException("Request not found.");
        }
        yield userGroupsDataAccess.DeleteById(userGroupRequest._id.toString());
        return `Successfully disconnected from the group ${groupToRemove.group_name}`;
    });
}
exports.removeGroupFromUser = removeGroupFromUser;
function addAdminToGroup(adminId, new_admin_email, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield userDataAccess.FindAllUsers({ email: new_admin_email }, { _id: 1, groups: 1 });
        if (users.length === 0) {
            throw new HttpException_1.NotFoundException("User with given email not found.");
        }
        const user = users[0];
        assertUserHasGroups(user);
        const userId = user._id;
        // Check if group ID is valid
        const group = yield groupDataAccess.FindById(groupId);
        if (!group || group.deleted) {
            throw new HttpException_1.NotFoundException("Group not found or deleted.");
        }
        // Check if user is connected to the group
        const groupIndex = user.groups.findIndex((group) => group.toString() === groupId);
        if (groupIndex === -1) {
            throw new HttpException_1.BadRequestException("User not connected to the Group.");
        }
        if (!group.admins_ids.map((id) => id.toString()).includes(adminId)) {
            console.log(new mongodb_1.ObjectId(adminId));
            console.log(group.admins_ids);
            throw new HttpException_1.UnauthorizedException("User not Unauthorized to add admin to this group");
        }
        if (group.admins_ids.map((id) => id.toString()).includes(userId.toString())) {
            throw new HttpException_1.BadRequestException("User already admin.");
        }
        group.admins_ids.push(userId);
        yield groupDataAccess.UpdateGroup(groupId.toString(), group);
        return `Successfully added ${user.email} as an admin of the group ${group.group_name}.`;
    });
}
exports.addAdminToGroup = addAdminToGroup;
function updateGroup(groupId, userId, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if a group with the same name already exists
        if (updateData.group_name) {
            const existingGroup = yield groupDataAccess.FindAllGroups({ group_name: updateData.group_name });
            if (existingGroup && existingGroup[0]._id.toString() !== groupId) {
                throw new HttpException_1.BadRequestException('A group with this name already exists');
            }
        }
        const group = yield groupDataAccess.FindById(groupId);
        if (!group.admins_ids.map((id) => id.toString()).includes(userId)) {
            throw new HttpException_1.UnauthorizedException("User not authorized to update the group");
        }
        // Only update allowed fields
        const dataToUpdate = {
            group_name: updateData.group_name || group.group_name,
            locations: updateData.locations || group.locations,
            active: updateData.active || group.active
        };
        return groupDataAccess.UpdateGroup(groupId, dataToUpdate);
    });
}
exports.updateGroup = updateGroup;
function uploadGroupImage(id, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = `groupsimages/${id}`;
        const image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        yield groupDataAccess.UpdateGroup(id, { image_URL });
        return image_URL;
    });
}
exports.uploadGroupImage = uploadGroupImage;
function getAllGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        return groupDataAccess.FindAllGroups({ deleted: false, type: { $ne: "GENERAL" } });
    });
}
exports.getAllGroups = getAllGroups;
function deleteGroupById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return groupDataAccess.DeleteGroupById(id);
    });
}
exports.deleteGroupById = deleteGroupById;
function markGroupAsDeleted(id) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Remove the group ID from all users
        const allUsersWithGroup = yield new UserDataAccess_1.default().FindAllUsers({ groups: new mongodb_1.ObjectId(id) });
        for (const user of allUsersWithGroup) {
            const updatedGroups = user.groups.filter((groupId) => groupId.toHexString() !== id);
            yield new UserDataAccess_1.default().Update(user._id.toString(), { groups: updatedGroups });
        }
        // 2. Delete all group requests with the given group ID
        const allGroupRequests = yield new UserGroupsDataAccess_1.default().FindAllUserGroups({ group_id: new mongodb_1.ObjectId(id) });
        for (const groupRequest of allGroupRequests) {
            yield new UserGroupsDataAccess_1.default().DeleteById(groupRequest._id.toString());
        }
        // 3. Mark the group as deleted and inactive
        return groupDataAccess.UpdateGroup(id, {
            deleted: true,
            active: "inactive",
        });
    });
}
exports.markGroupAsDeleted = markGroupAsDeleted;
// addGroup
function addGroup(group, file) {
    return __awaiter(this, void 0, void 0, function* () {
        yield checkIfGroupNameExists(group.group_name);
        let admins_ids = [];
        if (group.admin_email) {
            const adminId = yield getAdminIdFromEmail(group.admin_email);
            admins_ids = [adminId];
            delete group.admin_email; // Remove admin_email from group after using it
        }
        console.log("1");
        const newGroup = new GroupModel_1.default(Object.assign(Object.assign({}, group), { admins_ids: admins_ids }));
        console.log(newGroup);
        const newGroupId = yield addGroupToDatabase(newGroup);
        yield updateUserGroups(admins_ids[0], newGroupId);
        console.log("3");
        if (file) {
            console.log(newGroupId);
            yield handleFileUpload(file, newGroupId);
        }
        console.log("4");
        yield createNewConnectionRequest(admins_ids[0], newGroupId);
        console.log("5");
        return newGroupId;
    });
}
exports.addGroup = addGroup;
function checkIfGroupNameExists(groupName) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingGroups = yield groupDataAccess.FindAllGroups({
            group_name: groupName,
            deleted: false
        });
        console.log(existingGroups);
        if (existingGroups.length > 0) {
            throw new HttpException_1.BadRequestException("Group with this name already exists.");
        }
    });
}
function getAdminIdFromEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = (yield userDataAccess.FindAllUsers({ email }))[0];
        if (!user) {
            throw new HttpException_1.NotFoundException(`No admin found for email: ${email}`);
        }
        return user._id;
    });
}
function addGroupToDatabase(group) {
    return __awaiter(this, void 0, void 0, function* () {
        const groupInsertion = yield groupDataAccess.InsertOne(group);
        return groupInsertion.insertedId;
    });
}
function updateUserGroups(userId, newGroupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userDataAccess.FindById(userId.toString());
        const updatedUserGroups = [...user.groups, newGroupId];
        yield userDataAccess.Update(userId.toString(), { groups: updatedUserGroups });
    });
}
function handleFileUpload(file, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = `groupsimages/${groupId}`;
        yield uploadImageToFirebaseAndUpdateGroup(file, filePath, groupId.toString());
    });
}
function createNewConnectionRequest(userId, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const newConnectionRequestData = {
            user_id: userId,
            group_id: groupId,
            request_date: (0, TimeService_1.getCurrentTimeInIsrael)(),
            is_approved: 'approved'
        };
        const newConnectionRequest = new UserGroupsModel_1.default(newConnectionRequestData);
        newConnectionRequest.validateUserGroupReq();
        yield userGroupsDataAccess.InsertOne(newConnectionRequest);
    });
}
function updateGroupDetails(id, groupDetails, file) {
    return __awaiter(this, void 0, void 0, function* () {
        // If a file is provided, upload it and update photo_URL
        console.log(file);
        if (file) {
            try {
                const filePath = `groupsimages/${id}`;
                groupDetails.image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
            }
            catch (error) {
                throw new HttpException_1.InternalServerException("Error uploading image: " + error);
            }
        }
        try {
            const res = yield groupDataAccess.UpdateGroup(id, groupDetails);
            return res;
        }
        catch (error) {
            if (error instanceof mongodb_2.MongoError && error.code === 11000) {
                // This error code stands for 'Duplicate Key Error'
                const keyValue = error.keyValue;
                throw new HttpException_1.BadRequestException(`group with this ${Object.keys(keyValue)[0]} already exists.`);
            }
            throw new HttpException_1.BadRequestException("Error updating user details: " + error);
        }
    });
}
exports.updateGroupDetails = updateGroupDetails;
function uploadImageToFirebaseAndUpdateGroup(file, filePath, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        return groupDataAccess.UpdateGroup(groupId, { image_URL });
    });
}
exports.uploadImageToFirebaseAndUpdateGroup = uploadImageToFirebaseAndUpdateGroup;
//# sourceMappingURL=GroupService.js.map