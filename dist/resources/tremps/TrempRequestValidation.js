"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTrempRequest = exports.trempSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const HttpException_1 = require("../../middleware/HttpException");
const timePattern = joi_1.default.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required();
const sixDaysAgo = new Date();
sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
exports.trempSchema = joi_1.default.object({
    creator_id: joi_1.default.string().required(),
    group_id: joi_1.default.string().required(),
    tremp_type: joi_1.default.string().required(),
    dates: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.date().min(sixDaysAgo).iso().required()).required(),
    hour: timePattern,
    from_route: joi_1.default.object({
        name: joi_1.default.string().required(),
        coordinates: joi_1.default.object({
            latitude: joi_1.default.number().required(),
            longitude: joi_1.default.number().required(),
        }).required(),
    }).required(),
    to_route: joi_1.default.object().required().keys({
        name: joi_1.default.string().required(),
        coordinates: joi_1.default.object({
            latitude: joi_1.default.number().required(),
            longitude: joi_1.default.number().required(),
        }).required(),
    }),
    seats_amount: joi_1.default.number().required(),
    note: joi_1.default.string().optional(),
    is_permanent: joi_1.default.boolean().required(),
    return_drive: joi_1.default.object({
        is_active: joi_1.default.boolean().required(),
        return_hour: timePattern,
    }).required(),
});
function validateTrempRequest(data) {
    const { error } = exports.trempSchema.validate(data);
    if (error) {
        throw new HttpException_1.BadRequestException(error.message);
    }
}
exports.validateTrempRequest = validateTrempRequest;
//# sourceMappingURL=TrempRequestValidation.js.map