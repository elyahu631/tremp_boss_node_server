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
exports.getUserRequests = exports.uploadGroupRequestImage = exports.addGroupRequest = void 0;
const mongodb_1 = require("mongodb");
const fileUpload_1 = require("../../firebase/fileUpload");
const HttpException_1 = require("../../middleware/HttpException");
const GroupRequestDataAccess_1 = __importDefault(require("./GroupRequestDataAccess"));
const groupReqDataAccess = new GroupRequestDataAccess_1.default();
function addGroupRequest(groupReq) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if group with this name already exists
        const existingGroups = yield groupReqDataAccess.FindAllGroupReq({
            group_name: groupReq.group_name
        });
        if (existingGroups.length > 0) {
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
//# sourceMappingURL=GroupRequestService.js.map