// src/firebase/storge.ts
import { Storage } from "@google-cloud/storage";
import path from "path";
import { FIREBASE_ENV } from "../config/environment";

// Firebase config
const firebaseConfig = {
  credentials: FIREBASE_ENV,
  projectId: "tremp-boss--storage", 
  bucketName: "tremp-boss--storage.appspot.com", 
};


// Initialize Google Cloud Storage
const storage = new Storage(firebaseConfig);

export const bucket = storage.bucket(firebaseConfig.bucketName);
