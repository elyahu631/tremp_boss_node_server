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
        this.description = groupData.description;
        this.type = groupData.type;
        this.image_URL = groupData.image_URL;
        this.locations = groupData.locations;
        this.admins_ids = groupData.admins_ids || [];
        this.active = groupData.active || 'active';
        this.deleted = groupData.deleted || false;
    }
    validateGroup() {
        const schema = joi_1.default.object({
            _id: joi_1.default.any().optional(),
            group_name: joi_1.default.string().required(),
            description: joi_1.default.string().allow('').max(500).optional(),
            type: joi_1.default.string()
                .required()
                .valid('GENERAL', 'PRIVATE'),
            image_URL: joi_1.default.string().allow('').optional(),
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
            admins_ids: joi_1.default.array().items(joi_1.default.any()).optional(),
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