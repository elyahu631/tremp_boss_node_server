"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdatedUser = void 0;
// resources/users/UserValidation.ts
const joi_1 = __importDefault(require("joi"));
function validateUpdatedUser(updatedUser) {
    const schema = joi_1.default.object({
        user_email: joi_1.default.string().email().optional(),
        phone_number: joi_1.default.string().optional(),
        password: joi_1.default.string().min(6).optional(),
        first_name: joi_1.default.string().optional(),
        last_name: joi_1.default.string().optional(),
        gender: joi_1.default.string().valid('M', 'F').optional(),
        status: joi_1.default.string().valid('active', 'inactive').optional(),
        deleted: joi_1.default.boolean().optional()
    });
    const { error } = schema.validate(updatedUser);
    if (error) {
        console.log('====================================');
        console.log(error.details[0].message);
        console.log('====================================');
        return false;
    }
    return true;
}
exports.validateUpdatedUser = validateUpdatedUser;
//# sourceMappingURL=UserValidation.js.map