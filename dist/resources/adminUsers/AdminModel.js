"use strict";
// src/resources/adminUsers/AdminModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const TimeService_1 = require("../../utils/TimeService");
class AdminModel {
    constructor(adminData) {
        this.email = adminData.email;
        this.username = adminData.username;
        this.first_name = adminData.first_name;
        this.last_name = adminData.last_name;
        this.password = adminData.password;
        this.role = adminData.role;
        this.phone_number = adminData.phone_number;
        this.photo_URL = adminData.photo_URL;
        this.account_activated = adminData.account_activated;
        this.createdAt = adminData.createdAt || (0, TimeService_1.getCurrentTimeInIsrael)();
        this.updatedAt = adminData.updatedAt || (0, TimeService_1.getCurrentTimeInIsrael)();
        this.last_login_date = adminData.last_login_date;
        this.deleted = adminData.deleted || false;
    }
    validateNewAdmin() {
        const schema = joi_1.default.object({
            username: joi_1.default.string().required(),
            email: joi_1.default.string().email().required(),
            phone_number: joi_1.default.string().required(),
            password: joi_1.default.string().min(8).required(),
            first_name: joi_1.default.string().required(),
            last_name: joi_1.default.string().required(),
            role: joi_1.default.string().required(),
            account_activated: joi_1.default.boolean().required(),
            photo_URL: joi_1.default.string().optional(),
            createdAt: joi_1.default.string().isoDate().required(),
            updatedAt: joi_1.default.string().isoDate().required(),
            last_login_date: joi_1.default.string().isoDate().allow(null),
            deleted: joi_1.default.boolean().required()
        });
        const { error } = schema.validate(this);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}
exports.default = AdminModel;
//# sourceMappingURL=AdminModel.js.map