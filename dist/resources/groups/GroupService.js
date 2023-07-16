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
exports.uploadImageToFirebaseAndUpdateUser = exports.updateGroupDetails = exports.addGroup = exports.markGroupAsDeleted = exports.deleteGroupById = exports.getGroupById = exports.getAllGroups = void 0;
const GroupDataAccess_1 = __importDefault(require("./GroupDataAccess"));
const fileUpload_1 = require("../../firebase/fileUpload");
const HttpException_1 = require("../../middleware/HttpException");
const mongodb_1 = require("mongodb");
const groupDataAccess = new GroupDataAccess_1.default();
function getAllGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        return groupDataAccess.FindAllGroups({ deleted: false, type: { $ne: "GENERAL" } });
    });
}
exports.getAllGroups = getAllGroups;
function getGroupById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return groupDataAccess.FindById(id);
    });
}
exports.getGroupById = getGroupById;
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
            if (error instanceof mongodb_1.MongoError && error.code === 11000) {
                // This error code stands for 'Duplicate Key Error'
                const keyValue = error.keyValue;
                throw new HttpException_1.BadRequestException(`group with this ${Object.keys(keyValue)[0]} already exists.`);
            }
            throw new HttpException_1.BadRequestException("Error updating user details: " + error);
        }
    });
}
exports.updateGroupDetails = updateGroupDetails;
function uploadImageToFirebaseAndUpdateUser(file, filePath, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        return groupDataAccess.UpdateGroup(groupId, { image_URL });
    });
}
exports.uploadImageToFirebaseAndUpdateUser = uploadImageToFirebaseAndUpdateUser;
//# sourceMappingURL=GroupService.js.map