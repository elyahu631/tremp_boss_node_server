"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
/**
 *  this code sets up a configuration for multer that allows you to handle file uploads.
 *  It uses memoryStorage() to store files in memory and limits the file size to 5MB to
 *  avoid excessive memory usage.
 */
const multerConfig = {
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
};
exports.default = multerConfig;
//# sourceMappingURL=multerConfig.js.map