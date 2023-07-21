"use strict";
// src/resources/gifts/GiftModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const mongodb_1 = require("mongodb");
class GiftModel {
    constructor(giftData) {
        this._id = giftData._id || new mongodb_1.ObjectId;
        this.image_URL = giftData.image_URL;
        this.gift_name = giftData.gift_name;
        this.price = giftData.price;
        this.quantity = giftData.quantity;
        this.collect_place = giftData.collect_place;
        this.deleted = giftData.deleted || false;
    }
    validateGift() {
        const schema = joi_1.default.object({
            _id: joi_1.default.optional(),
            image_URL: joi_1.default.string().optional(),
            gift_name: joi_1.default.string().required(),
            price: joi_1.default.number().required(),
            quantity: joi_1.default.number().required(),
            collect_place: joi_1.default.string().required(),
            deleted: joi_1.default.boolean().required()
        });
        const { error } = schema.validate(this);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}
exports.default = GiftModel;
//# sourceMappingURL=GiftModel.js.map