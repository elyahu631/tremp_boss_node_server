"use strict";
// src/resources/tremps/TrempModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const TimeService_1 = require("../../utils/TimeService");
class TrempModel {
    constructor(trempData) {
        this.creator_id = trempData.creator_id;
        this.group_id = trempData.group_id;
        this.tremp_type = trempData.tremp_type;
        this.create_date = trempData.create_date || (0, TimeService_1.getCurrentTimeInIsrael)();
        this.tremp_time = trempData.tremp_time;
        this.from_root = trempData.from_root;
        this.to_root = trempData.to_root;
        this.note = trempData.note;
        this.seats_amount = trempData.seats_amount || 1;
        this.users_in_tremp = trempData.users_in_tremp || [];
        this.is_full = trempData.is_full || false;
        this.chat_id = trempData.chat_id;
        this.active = trempData.active || true;
        this.deleted = trempData.deleted || false;
    }
    validateTremp() {
        const schema = joi_1.default.object({
            creator_id: joi_1.default.string().required(),
            group_id: joi_1.default.string().required(),
            tremp_type: joi_1.default.string().valid('driver', 'hitchhiker').required(),
            create_date: joi_1.default.string().required(),
            tremp_time: joi_1.default.string().required(),
            from_root: joi_1.default.object({
                name: joi_1.default.string().required(),
                coordinates: joi_1.default.object({
                    latitude: joi_1.default.number().required(),
                    longitude: joi_1.default.number().required(),
                }).required(),
            }).required(),
            to_root: joi_1.default.object({
                name: joi_1.default.string().required(),
                coordinates: joi_1.default.object({
                    latitude: joi_1.default.number().required(),
                    longitude: joi_1.default.number().required(),
                }).required(),
            }).required(),
            note: joi_1.default.string().optional(),
            seats_amount: joi_1.default.number().integer().min(1).required(),
            users_in_tremp: joi_1.default.array().items(joi_1.default.object({
                user_id: joi_1.default.string().required(),
                is_approved: joi_1.default.string().valid('approved', 'pending', 'denied').default('pending').required(),
            })).optional(),
            is_full: joi_1.default.boolean().required(),
            chat_id: joi_1.default.string().optional(),
            active: joi_1.default.boolean().required(),
            deleted: joi_1.default.boolean().required(),
        });
        const { error } = schema.validate(this);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }
}
exports.default = TrempModel;
//# sourceMappingURL=TrempModel.js.map