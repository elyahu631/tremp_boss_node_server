"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const mongodb_1 = require("mongodb");
const TimeService_1 = require("../../services/TimeService");
class GroupRequestModel {
    constructor(groupReqData) {
        this.user_id = new mongodb_1.ObjectId(groupReqData.user_id);
        this.group_name = groupReqData.group_name;
        this.type = groupReqData.type;
        this.image_URL = groupReqData.image_URL;
        this.request_date = groupReqData.request_date || (0, TimeService_1.getCurrentTimeInIsrael)();
        this.locations = groupReqData.locations;
        this.is_approved = groupReqData.is_approved || 'pending';
    }
    validateGroupRequest() {
        const schema = joi_1.default.object({
            user_id: joi_1.default.required(),
            group_name: joi_1.default.string().required(),
            type: joi_1.default.string()
                .required()
                .valid('PRIVATE'),
            image_URL: joi_1.default.string().optional(),
            request_date: joi_1.default.date().required(),
            locations: joi_1.default.array().items(joi_1.default.object({
                name: joi_1.default.string().required(),
                coordinates: joi_1.default.object({
                    latitude: joi_1.default.number()
                        .required()
                        .min(-90)
                        .max(90),
                    longitude: joi_1.default.number()
                        .required()
                        .min(-180)
                        .max(180),
                }).required(),
            })).required(),
            is_approved: joi_1.default.string().valid('approved', 'pending', 'denied').default('pending'),
        });
        const { error } = schema.validate(this);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}
exports.default = GroupRequestModel;
//# sourceMappingURL=GroupRequestModel.js.map