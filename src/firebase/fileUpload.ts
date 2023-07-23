import path from "path";
import { bucket } from "../firebase/storage";
import * as admin from 'firebase-admin';

export async function uploadImageToFirebase(file: Express.Multer.File, filePath: string): Promise<string> {
  // Extract the original file extension
  const originalExtension = path.extname(file.originalname);

  // Combine the filePath with the original file extension to create the new filename
  const filename = `${filePath}${originalExtension}`;

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




export async function uploadBase64ImageToFirebase(base64Image: string, filePath: string): Promise<string> {
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
        contentType: 'image/jpeg',  // adjust this according to your image type
      },
    };

    // Upload the buffer to the specified blob
    await blob.save(buffer, uploadOptions);

    // Make the image publicly accessible
    await blob.makePublic();

    // Construct the public URL for the image
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURI(path.normalize(blob.name))}`;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading base64 image to Firebase:', error);
    throw error;  // re-throw the error to be handled by the calling function
  }
}