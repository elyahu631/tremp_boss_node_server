"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const mongodb_1 = require("mongodb");
class GroupModel {
    constructor(groupData) {
        this._id = groupData._id || new mongodb_1.ObjectId();
        this.group_name = groupData.group_name;
        this.type = groupData.type;
        this.image_URL = groupData.image_URL;
        this.location = groupData.location;
        this.active = groupData.active || 'active';
        this.deleted = groupData.deleted || false;
    }
    validateGroup() {
        const schema = joi_1.default.object({
            _id: joi_1.default.any().optional(),
            group_name: joi_1.default.string().required(),
            type: joi_1.default.string()
                .required()
                .valid('CITIES', 'PRIVATE'),
            image_URL: joi_1.default.string().optional(),
            location: joi_1.default.array().items(joi_1.default.object({
                latitude: joi_1.default.number()
                    .required()
                    .min(-90)
                    .max(90),
                longitude: joi_1.default.number()
                    .required()
                    .min(-180)
                    .max(180),
            })).required(),
            active: joi_1.default.string()
                .required()
                .valid('active', 'inactive'),
            deleted: joi_1.default.boolean().required(),
        });
        const { error } = schema.validate(this);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}
exports.default = GroupModel;
//# sourceMappingURL=GroupModel.js.map