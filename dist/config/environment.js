"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIREBASE_ENV = exports.JWT_SECRET = exports.PORT = exports.DB_NAME = exports.DB_URI = void 0;
// src/config/environment.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.DB_URI = process.env.DB_URI || "";
exports.DB_NAME = process.env.DB_NAME || "";
exports.PORT = process.env.PORT || 8000;
exports.JWT_SECRET = process.env.JWT_SECRET || "";
exports.FIREBASE_ENV = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID || "",
    private_key_id: process.env.PRIVATE_KEY_ID || "",
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n') || "",
    client_email: process.env.CLIENT_EMAIL || "",
    client_id: process.env.CLIENT_ID || "",
    auth_uri: process.env.AUTH_URI || "",
    token_uri: process.env.TOKEN_URI || "",
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL || "",
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL || "",
};
//# sourceMappingURL=environment.js.map