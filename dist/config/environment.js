"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.PORT = exports.DB_NAME = exports.DB_URI = void 0;
// src/config/environment.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.DB_URI = process.env.DB_URI || "";
exports.DB_NAME = process.env.DB_NAME || "";
exports.PORT = process.env.PORT || 8000;
exports.JWT_SECRET = process.env.JWT_SECRET || "";
//# sourceMappingURL=environment.js.map