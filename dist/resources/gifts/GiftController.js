"use strict";
// src/resources/gifts/GiftController.ts
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
exports.updateGiftDetails = exports.addGift = exports.markGiftAsDeleted = exports.deleteGiftById = exports.getGiftById = exports.getAllGifts = void 0;
const GiftService = __importStar(require("./GiftService"));
const GiftModel_1 = __importDefault(require("./GiftModel"));
function getAllGifts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const gifts = yield GiftService.getAllGifts();
            return res.status(200).json(gifts);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
}
exports.getAllGifts = getAllGifts;
function getGiftById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const gift = yield GiftService.getGiftById(id);
            return res.status(200).json(gift);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
}
exports.getGiftById = getGiftById;
function deleteGiftById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield GiftService.deleteGiftById(id);
            return res.status(200).json({ message: "Gift successfully deleted" });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
}
exports.deleteGiftById = deleteGiftById;
function markGiftAsDeleted(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield GiftService.markGiftAsDeleted(id);
            return res
                .status(200)
                .json({ message: "Gift deletion status successfully updated" });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
}
exports.markGiftAsDeleted = markGiftAsDeleted;
function addGift(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newGift = new GiftModel_1.default(req.body);
            let giftInsertion = yield GiftService.addGift(newGift);
            let savedGift = giftInsertion.insertedId;
            if (req.file) {
                const filePath = `giftsimages/${giftInsertion.insertedId}`;
                yield GiftService.uploadImageToFirebaseAndUpdateGift(req.file, filePath, savedGift);
                savedGift = yield GiftService.getGiftById(savedGift); // Get updated gift
            }
            return res.status(201).json(savedGift);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    });
}
exports.addGift = addGift;
function updateGiftDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const giftDetails = req.body;
            console.log(giftDetails);
            const updatedGift = yield GiftService.UpdateGiftDetails(id, giftDetails, req.file);
            console.log(updatedGift);
            return res.status(200).json([updatedGift, { message: "gift updated successfully" }]);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
}
exports.updateGiftDetails = updateGiftDetails;
//# sourceMappingURL=GiftController.js.map