// src/config/multerConfig.ts
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from "express";
import { API_KEY, API_SECERT, CLOUD_NAME } from './environment';

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECERT,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: (req: Request, file: Express.Multer.File) => {
    // Generate a unique public_id for each uploaded file
    const uniqueFilename = `${file.fieldname}-${Date.now()}`;

    return {
      folder: 'admin_users_images',
      format: 'png',
      public_id: uniqueFilename,
    };
  },
});


export const parser = multer({ storage: storage });
