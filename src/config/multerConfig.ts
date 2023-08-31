import multer from 'multer';

/**
 *  this code sets up a configuration for multer that allows you to handle file uploads.
 *  It uses memoryStorage() to store files in memory and limits the file size to 5MB to 
 *  avoid excessive memory usage.
 */ 
const multerConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
};

export default multerConfig;
