"use strict";
// src/resources/users/UserModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const mongodb_1 = require("mongodb");
class UserModel {
    constructor(userData) {
        this.user_email = userData.user_email;
        this.password = userData.password;
        this.phone_number = userData.phone_number;
        this.photo_URL = userData.photo_URL;
        this.first_name = userData.first_name;
        this.last_name = userData.last_name;
        this.gender = userData.gender;
        this.coins = userData.coins || 0;
        this.createdAt = userData.createdAt || new Date().toISOString();
        this.updatedAt = userData.updatedAt || new Date().toISOString();
        this.last_login_date = userData.last_login_date;
        this.groups = userData.groups || [new mongodb_1.ObjectId("64743b14b165e7102c90dd32")];
        this.status = userData.status || "active";
        this.deleted = userData.deleted || false;
    }
    validateUser() {
        const schema = joi_1.default.object({
            user_email: joi_1.default.string().email().max(50).required(),
            password: joi_1.default.string().min(8).required(),
        });
        // Only validate the user_email and password properties
        const { error } = schema.validate({
            user_email: this.user_email,
            password: this.password,
        });
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}
exports.default = UserModel;
//# sourceMappingURL=UserModel.js.map