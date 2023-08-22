"use strict";
// src/resources/gifts/GiftDataAccess.ts
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
const db_1 = __importDefault(require("../../utils/db"));
class GiftDataAccess {
    FindAllGifts(query = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.FindAll(GiftDataAccess.collection, query);
        });
    }
    FindById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.FindByID(GiftDataAccess.collection, id);
        });
    }
    InsertOne(gift) {
        return __awaiter(this, void 0, void 0, function* () {
            gift.validateGift();
            return yield db_1.default.Insert(GiftDataAccess.collection, gift);
        });
    }
    DeleteGiftById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.DeleteById(GiftDataAccess.collection, id);
        });
    }
    UpdateGift(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.Update(GiftDataAccess.collection, id, updateData);
        });
    }
}
GiftDataAccess.collection = 'Gifts';
exports.default = GiftDataAccess;
//# sourceMappingURL=GiftDataAccess.js.map