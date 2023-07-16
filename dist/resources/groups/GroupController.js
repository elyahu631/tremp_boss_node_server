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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGroup = exports.updateGroupDetails = exports.markGroupAsDeleted = exports.deleteGroupById = exports.getGroupById = exports.getAllGroups = void 0;
const GroupService = __importStar(require("./GroupService"));
const GroupModel_1 = __importDefault(require("./GroupModel"));
const HttpException_1 = require("../../middleware/HttpException");
function getAllGroups(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const groups = yield GroupService.getAllGroups();
            res.status(200).json({ status: true, data: groups });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getAllGroups = getAllGroups;
function getGroupById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const group = yield GroupService.getGroupById(id);
            if (!group) {
                throw new HttpException_1.NotFoundException('Group not found');
            }
            res.status(200).json({ status: true, data: group });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getGroupById = getGroupById;
function deleteGroupById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield GroupService.deleteGroupById(id);
            res.status(200).json({ status: true, message: "Group successfully deleted" });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.deleteGroupById = deleteGroupById;
function markGroupAsDeleted(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield GroupService.markGroupAsDeleted(id);
            res.status(200).json({ status: true, message: "Group deletion status successfully updated" });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.markGroupAsDeleted = markGroupAsDeleted;
function updateGroupDetails(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const groupDetails = req.body;
            const updatedGroup = yield GroupService.updateGroupDetails(id, groupDetails, req.file);
            res.status(200).json({ status: true, data: updatedGroup, message: "Group updated successfully" });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.updateGroupDetails = updateGroupDetails;
function addGroup(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let groupData = req.body;
            if (Array.isArray(groupData.image_URL)) {
                // handle the case where image_URL is an array
                // here I'm taking the first element, but you may want to do something else
                groupData.image_URL = groupData.image_URL[0];
            }
            const newGroup = new GroupModel_1.default(groupData);
            const groupInsertion = yield GroupService.addGroup(newGroup);
            let savedGroup = groupInsertion.insertedId;
            if (req.file) {
                const filePath = `groupsimages/${groupInsertion.insertedId}`;
                yield GroupService.uploadImageToFirebaseAndUpdateUser(req.file, filePath, savedGroup);
                savedGroup = yield GroupService.getGroupById(savedGroup); // Get updated user
            }
            res.status(201).json({ status: true, data: savedGroup });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addGroup = addGroup;
//# sourceMappingURL=GroupController.js.map