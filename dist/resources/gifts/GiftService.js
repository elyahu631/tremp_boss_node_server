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
const fileUpload_1 = require("../../firebase/fileUpload");
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
            throw new Error("Gift with this name already exists.");
        }
        console.log(gift);
        // Insert the new gift into the database
        return giftDataAccess.InsertOne(gift);
    });
}
exports.addGift = addGift;
function uploadImageToFirebaseAndUpdateGift(file, filePath, giftId) {
    return __awaiter(this, void 0, void 0, function* () {
        const gift_image = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        return giftDataAccess.UpdateGift(giftId, { gift_image });
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
                giftDetails.gift_image = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
            }
            catch (error) {
                console.error("Error uploading image:", error);
            }
        }
        try {
            return yield giftDataAccess.UpdateGift(id, giftDetails);
        }
        catch (error) {
            console.error("Error updating user details:", error);
            throw (error);
        }
    });
}
exports.UpdateGiftDetails = UpdateGiftDetails;
//# sourceMappingURL=GiftService.js.map