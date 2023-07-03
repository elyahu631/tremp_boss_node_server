import { Storage } from "@google-cloud/storage";
import path from "path";

// Firebase config
const firebaseConfig = {
  keyFilename: path.join(__dirname, "./tremp-boss--storage-firebase-adminsdk-dfgnj-0ad7bd9808.json"),
  projectId: "tremp-boss--storage", 
  bucketName: "tremp-boss--storage.appspot.com", 
};

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: firebaseConfig.keyFilename,
  projectId: firebaseConfig.projectId,
});

export const bucket = storage.bucket(firebaseConfig.bucketName);
