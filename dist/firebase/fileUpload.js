"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToFirebase = void 0;
const path_1 = __importDefault(require("path"));
const storage_1 = require("../firebase/storage");
function uploadImageToFirebase(file, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Extract the original file extension
        const originalExtension = path_1.default.extname(file.originalname);
        // Combine the filePath with the original file extension to create the new filename
        const filename = `${filePath}${originalExtension}`;
        // upload the file to Firebase Cloud Storage
        const blob = storage_1.bucket.file(filename);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });
        const blobPromise = new Promise((resolve, reject) => {
            blobStream.on("error", (err) => {
                reject(err);
            });
            blobStream.on("finish", () => __awaiter(this, void 0, void 0, function* () {
                // Get URL of the uploaded file
                const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage_1.bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
                resolve(publicUrl);
            }));
        });
        blobStream.end(file.buffer);
        return yield blobPromise;
    });
}
exports.uploadImageToFirebase = uploadImageToFirebase;
//# sourceMappingURL=fileUpload.js.map