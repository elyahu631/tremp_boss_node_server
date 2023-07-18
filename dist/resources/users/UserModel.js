"use strict";
// src/resources/users/UserModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const mongodb_1 = require("mongodb");
const TimeService_1 = require("../../services/TimeService");
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
        this.createdAt = userData.createdAt || (0, TimeService_1.getCurrentTimeInIsrael)();
        this.updatedAt = userData.updatedAt || (0, TimeService_1.getCurrentTimeInIsrael)();
        this.last_login_date = userData.last_login_date;
        this.groups = userData.groups || [new mongodb_1.ObjectId("64743b14b165e7102c90dd32")];
        this.status = userData.status || "active";
        this.deleted = userData.deleted || false;
        this.notification_token = userData.notification_token || "";
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
    static fromUserDocument(userDocument) {
        // This creates a new UserModel and copies all properties from the userDocument to it
        return new UserModel(userDocument);
    }
}
exports.default = UserModel;
//# sourceMappingURL=UserModel.js.map