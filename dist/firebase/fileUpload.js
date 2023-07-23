"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.uploadBase64ImageToFirebase = exports.uploadImageToFirebase = void 0;
const path_1 = __importDefault(require("path"));
const storage_1 = require("../firebase/storage");
const admin = __importStar(require("firebase-admin"));
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
function uploadBase64ImageToFirebase(base64Image, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get a reference to the storage bucket
            const bucket = admin.storage().bucket();
            // Create a new blob in the bucket and upload the file data.
            const blob = bucket.file(filePath);
            // Convert the base64 string to a buffer
            const buffer = Buffer.from(base64Image, 'base64');
            // Define the upload options
            const uploadOptions = {
                metadata: {
                    contentType: 'image/jpeg', // adjust this according to your image type
                },
            };
            // Upload the buffer to the specified blob
            yield blob.save(buffer, uploadOptions);
            // Make the image publicly accessible
            yield blob.makePublic();
            // Construct the public URL for the image
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURI(path_1.default.normalize(blob.name))}`;
            return publicUrl;
        }
        catch (error) {
            console.error('Error uploading base64 image to Firebase:', error);
            throw error; // re-throw the error to be handled by the calling function
        }
    });
}
exports.uploadBase64ImageToFirebase = uploadBase64ImageToFirebase;
//# sourceMappingURL=fileUpload.js.map