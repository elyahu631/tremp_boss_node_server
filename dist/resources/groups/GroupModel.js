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
        this.locations = groupData.locations;
        this.active = groupData.active || "active";
        this.deleted = groupData.deleted || false;
    }
    validateGroup() {
        const schema = joi_1.default.object({
            _id: joi_1.default.optional(),
            group_name: joi_1.default.string().required(),
            type: joi_1.default.string().required(),
            image_URL: joi_1.default.string().optional(),
            locations: joi_1.default.array().items(joi_1.default.object({
                name: joi_1.default.string().required(),
                coordinates: joi_1.default.object({
                    latitude: joi_1.default.number().required(),
                    longitude: joi_1.default.number().required(),
                }).required(),
            })).required(),
            active: joi_1.default.string().required(),
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