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
exports.getUserRequests = exports.uploadGroupRequestImage = exports.addGroupRequest = void 0;
const GroupRequestService = __importStar(require("./GroupRequestService"));
const GroupRequestModel_1 = __importDefault(require("./GroupRequestModel"));
const HttpException_1 = require("../../middleware/HttpException");
function addGroupRequest(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newOpenGroup = new GroupRequestModel_1.default(req.body);
            const savedOpenGroup = yield GroupRequestService.addGroupRequest(newOpenGroup);
            res.status(201).json({ status: true, data: savedOpenGroup });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addGroupRequest = addGroupRequest;
function uploadGroupRequestImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let file;
            if (Array.isArray(req.files)) {
                file = req.files[0];
            }
            else {
                file = req.files[Object.keys(req.files)[0]][0];
            }
            if (!file) {
                throw new HttpException_1.BadRequestException('No image provided.');
            }
            const { id } = req.params;
            const imageUrl = yield GroupRequestService.uploadGroupRequestImage(id, file);
            res.status(200).json({ status: true, message: "Image uploaded successfully", data: { image_URL: imageUrl } });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.uploadGroupRequestImage = uploadGroupRequestImage;
function getUserRequests(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_id } = req.body;
            const userRequests = yield GroupRequestService.getUserRequests(user_id);
            res.status(200).json({ status: true, data: userRequests });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getUserRequests = getUserRequests;
//# sourceMappingURL=GroupRequestController.js.map