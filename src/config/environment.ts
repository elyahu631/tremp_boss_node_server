// src/config/environment.ts
import dotenv from 'dotenv';
dotenv.config();

export const DB_URI = process.env.DB_URI || "";
export const DB_NAME = process.env.DB_NAME || "";
export const PORT = process.env.PORT || 8000;
export const JWT_SECRET = process.env.JWT_SECRET || "";
export const FIREBASE_ENV = 
{
  type:process.env.TYPE,
  project_id: process.env.PROJECT_ID || "",
  private_key_id: process.env.PRIVATE_KEY_ID || "",
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n') || "",
  client_email: process.env.CLIENT_EMAIL || "",
  client_id: process.env.CLIENT_ID || "",
  auth_uri: process.env.AUTH_URI || "",
  token_uri: process.env.TOKEN_URI || "",
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL || "",
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL || "",
}
export const SERVER_KEY = process.env.SERVER_KEY || "";

