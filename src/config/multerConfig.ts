import multer from 'multer';

const multerConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
};

export default multerConfig;
