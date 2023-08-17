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
exports.uploadImageToFirebaseAndUpdateGroup = exports.updateGroupDetails = exports.addGroup = exports.markGroupAsDeleted = exports.deleteGroupById = exports.getAllGroups = exports.removeGroupFromUser = exports.addGroupToUser = exports.getConnectedGroups = exports.getGroupsUserNotConnected = exports.getGroupById = void 0;
const GroupDataAccess_1 = __importDefault(require("./GroupDataAccess"));
const mongodb_1 = require("mongodb");
const fileUpload_1 = require("../../firebase/fileUpload");
const HttpException_1 = require("../../middleware/HttpException");
const mongodb_2 = require("mongodb");
const UserDataAccess_1 = __importDefault(require("../users/UserDataAccess"));
const groupDataAccess = new GroupDataAccess_1.default();
const userDataAccess = new UserDataAccess_1.default();
function getGroupById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return groupDataAccess.FindById(id);
    });
}
exports.getGroupById = getGroupById;
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
        // Add the group to the user's groups
        user.groups.push(new mongodb_1.ObjectId(groupId));
        yield userDataAccess.UpdateUserDetails(user._id.toString(), user);
        return groupToAdd;
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
        return `Successfully disconnected from the group ${groupToRemove.group_name}`;
    });
}
exports.removeGroupFromUser = removeGroupFromUser;
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
        return groupDataAccess.UpdateGroup(id, { deleted: true });
    });
}
exports.markGroupAsDeleted = markGroupAsDeleted;
function addGroup(group) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingGroups = yield groupDataAccess.FindAllGroups({
            group_name: group.group_name
        });
        if (existingGroups.length > 0) {
            throw new HttpException_1.BadRequestException("Group with this name already exists.");
        }
        return groupDataAccess.InsertOne(group);
    });
}
exports.addGroup = addGroup;
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