import path from "path";
import { v4 as uuidv4 } from "uuid";
import { bucket } from "../firebase/storage";

export async function uploadImageToFirebase(file: Express.Multer.File, filePath: string): Promise<string> {
  
  // Generate a unique identifier
  const uniqueId = uuidv4();

  // Extract the original file extension
  const originalExtension = path.extname(file.originalname);

  // Combine the filePath with the unique identifier and original file extension to create the new filename
  const filename = `${filePath}-${uniqueId}${originalExtension}`;

  // upload the file to Firebase Cloud Storage
  const blob = bucket.file(filename);

  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  const blobPromise = new Promise<string>((resolve, reject) => {
    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", async () => {
      // Get URL of the uploaded file
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURIComponent(blob.name)}?alt=media`;
      resolve(publicUrl);
    });
  });

  blobStream.end(file.buffer);
  return await blobPromise;
}
