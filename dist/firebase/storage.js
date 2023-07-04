"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
// src/firebase/storge.ts
const storage_1 = require("@google-cloud/storage");
const path_1 = __importDefault(require("path"));
// Firebase config
const firebaseConfig = {
    keyFilename: path_1.default.resolve(__dirname, '..', '..', 'src', 'firebase', 'trempboss.json'),
    projectId: "tremp-boss--storage",
    bucketName: "tremp-boss--storage.appspot.com",
};
// Initialize Google Cloud Storage
const storage = new storage_1.Storage({
    keyFilename: firebaseConfig.keyFilename,
    projectId: firebaseConfig.projectId,
});
exports.bucket = storage.bucket(firebaseConfig.bucketName);
//# sourceMappingURL=storage.js.map