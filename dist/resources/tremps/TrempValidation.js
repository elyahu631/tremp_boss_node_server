"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTremp = void 0;
const joi_1 = __importDefault(require("joi"));
function validateTremp(tremp) {
    const schema = joi_1.default.object({
        creator_id: joi_1.default.string().required(),
        group_id: joi_1.default.string().required(),
        tremp_type: joi_1.default.string().required(),
        create_date: joi_1.default.date().iso().required(),
        tremp_time: joi_1.default.date().iso().required(),
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
        seats_amount: joi_1.default.number().integer().required(),
        users_in_tremp: joi_1.default.array().items(joi_1.default.object({
            user_id: joi_1.default.string().required(),
            is_approved: joi_1.default.string().required(),
        })).required(),
        is_full: joi_1.default.boolean().required(),
        chat_id: joi_1.default.string().required(),
        active: joi_1.default.string().required(),
        deleted: joi_1.default.boolean().required(),
    });
    const { error } = schema.validate(tremp);
    if (error) {
        console.log('====================================');
        console.log(error.details[0].message);
        console.log('====================================');
        return false;
    }
    return true;
}
exports.validateTremp = validateTremp;
//# sourceMappingURL=TrempValidation.js.map