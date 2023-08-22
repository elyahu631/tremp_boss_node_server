"use strict";
// src/resources/tremps/TrempModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const TimeService_1 = require("../../services/TimeService");
class UserGroupsModel {
    constructor(userGroupReqData) {
        this.user_id = userGroupReqData.user_id;
        this.group_id = userGroupReqData.group_id;
        this.request_date = userGroupReqData.request_date || (0, TimeService_1.getCurrentTimeInIsrael)();
        this.is_approved = userGroupReqData.is_approved || 'pending';
    }
    validateUserGroupReq() {
        const schema = joi_1.default.object({
            user_id: joi_1.default.required(),
            group_id: joi_1.default.required(),
            request_date: joi_1.default.date().required(),
            is_approved: joi_1.default.string().valid('approved', 'pending', 'denied').default('pending'),
        });
        const { error } = schema.validate(this);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}
exports.default = UserGroupsModel;
//# sourceMappingURL=UserGroupsModel.js.map