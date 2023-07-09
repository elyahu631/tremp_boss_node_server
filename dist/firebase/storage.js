"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
// src/firebase/storge.ts
const storage_1 = require("@google-cloud/storage");
const environment_1 = require("../config/environment");
// Firebase config
const firebaseConfig = {
    credentials: environment_1.FIREBASE_ENV,
    projectId: "tremp-boss--storage",
    bucketName: "tremp-boss--storage.appspot.com",
};
// Initialize Google Cloud Storage
const storage = new storage_1.Storage(firebaseConfig);
exports.bucket = storage.bucket(firebaseConfig.bucketName);
//# sourceMappingURL=storage.js.map