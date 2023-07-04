// src/firebase/storge.ts
import { Storage } from "@google-cloud/storage";
import path from "path";

// Firebase config
const firebaseConfig = {
  keyFilename: path.resolve(__dirname, '..', '..', 'src', 'firebase', 'trempboss.json'),
  projectId: "tremp-boss--storage", 
  bucketName: "tremp-boss--storage.appspot.com", 
};


// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: firebaseConfig.keyFilename,
  projectId: firebaseConfig.projectId,
});

export const bucket = storage.bucket(firebaseConfig.bucketName);
