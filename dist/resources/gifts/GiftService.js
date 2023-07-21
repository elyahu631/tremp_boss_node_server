"use strict";
// src/resources/gifts/GiftService.ts
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
exports.UpdateGiftDetails = exports.UpdateGift = exports.uploadImageToFirebaseAndUpdateGift = exports.addGift = exports.markGiftAsDeleted = exports.deleteGiftById = exports.getGiftById = exports.getAllGifts = void 0;
const mongodb_1 = require("mongodb");
const fileUpload_1 = require("../../firebase/fileUpload");
const HttpException_1 = require("../../middleware/HttpException");
const GiftDataAccess_1 = __importDefault(require("./GiftDataAccess"));
const giftDataAccess = new GiftDataAccess_1.default();
function getAllGifts() {
    return __awaiter(this, void 0, void 0, function* () {
        return giftDataAccess.FindAllGifts({ deleted: false });
    });
}
exports.getAllGifts = getAllGifts;
function getGiftById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return giftDataAccess.FindById(id);
    });
}
exports.getGiftById = getGiftById;
function deleteGiftById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return giftDataAccess.DeleteGiftById(id);
    });
}
exports.deleteGiftById = deleteGiftById;
function markGiftAsDeleted(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return giftDataAccess.UpdateGift(id, { deleted: true });
    });
}
exports.markGiftAsDeleted = markGiftAsDeleted;
function addGift(gift) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if user with this username or email already exists
        const existingGifts = yield giftDataAccess.FindAllGifts({
            gift_name: gift.gift_name
        });
        if (existingGifts.length > 0) {
            throw new HttpException_1.BadRequestException("Gift with this name already exists.");
        }
        // Insert the new gift into the database
        return giftDataAccess.InsertOne(gift);
    });
}
exports.addGift = addGift;
function uploadImageToFirebaseAndUpdateGift(file, filePath, giftId) {
    return __awaiter(this, void 0, void 0, function* () {
        const image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        return giftDataAccess.UpdateGift(giftId, { image_URL });
    });
}
exports.uploadImageToFirebaseAndUpdateGift = uploadImageToFirebaseAndUpdateGift;
function UpdateGift(id, updatedGift) {
    return __awaiter(this, void 0, void 0, function* () {
        return giftDataAccess.UpdateGift(id, updatedGift);
    });
}
exports.UpdateGift = UpdateGift;
function UpdateGiftDetails(id, giftDetails, file) {
    return __awaiter(this, void 0, void 0, function* () {
        // If a file is provided, upload it and update photo_URL
        if (file) {
            try {
                const filePath = `usersimages/${id}`;
                giftDetails.image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
            }
            catch (error) {
                throw new HttpException_1.InternalServerException("Error uploading image: " + error);
            }
        }
        try {
            const res = yield giftDataAccess.UpdateGift(id, giftDetails);
            return res;
        }
        catch (error) {
            if (error instanceof mongodb_1.MongoError && error.code === 11000) {
                // This error code stands for 'Duplicate Key Error'
                const keyValue = error.keyValue;
                throw new HttpException_1.BadRequestException(`Gift with this ${Object.keys(keyValue)[0]} already exists.`);
            }
            throw new HttpException_1.BadRequestException("Error updating user details: " + error);
        }
    });
}
exports.UpdateGiftDetails = UpdateGiftDetails;
//# sourceMappingURL=GiftService.js.map