"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const mongodb_1 = require("mongodb");
class OpenGroupModel {
    constructor(openGroupData) {
        this.user_id = new mongodb_1.ObjectId(openGroupData.user_id);
        this.group_name = openGroupData.group_name;
        this.type = openGroupData.type;
        this.image_URL = openGroupData.image_URL;
        this.locations = openGroupData.locations;
    }
    validateOpenGroup() {
        const schema = joi_1.default.object({
            user_id: joi_1.default.string().required(),
            group_name: joi_1.default.string().required(),
            type: joi_1.default.string()
                .required()
                .valid('PRIVATE'),
            image_URL: joi_1.default.string().optional(),
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
        });
        const { error } = schema.validate(this);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}
exports.default = OpenGroupModel;
//# sourceMappingURL=OpenGroupsModel.js.map