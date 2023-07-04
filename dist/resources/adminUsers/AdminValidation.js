"use strict";
// src/resources/adminUsers/AdminValidation.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdminUpdates = void 0;
const joi_1 = __importDefault(require("joi"));
function validateAdminUpdates(updateAdminUserDetails) {
    const schema = joi_1.default.object({
        username: joi_1.default.string(),
        email: joi_1.default.string().email(),
        phone_number: joi_1.default.string(),
        first_name: joi_1.default.string(),
        last_name: joi_1.default.string(),
        role: joi_1.default.string(),
        photo_URL: joi_1.default.string(),
        last_login_date: joi_1.default.string().isoDate().allow(null),
        deleted: joi_1.default.boolean(),
        password: joi_1.default.string().min(8),
        account_activated: joi_1.default.boolean(),
        updatedAt: joi_1.default.string().isoDate().allow(null),
    });
    const { error } = schema.validate(updateAdminUserDetails);
    if (error) {
        console.log('====================================');
        console.log(error.details[0].message);
        console.log('====================================');
        return false;
    }
    return true;
}
exports.validateAdminUpdates = validateAdminUpdates;
//# sourceMappingURL=AdminValidation.js.map