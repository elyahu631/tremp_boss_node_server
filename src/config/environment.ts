// src/config/environment.ts
import dotenv from 'dotenv';
dotenv.config();

export const DB_URI = process.env.DB_URI || "";
export const DB_NAME = process.env.DB_NAME || "";
export const PORT = process.env.PORT || 8000;
export const JWT_SECRET = process.env.JWT_SECRET || "";
export const CLOUD_NAME = process.env.CLOUD_NAME || "";
export const API_KEY = process.env.JWT_SECRET || "";
export const API_SECERT = process.env.JWT_SECRET || "";