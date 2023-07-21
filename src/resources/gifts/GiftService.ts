// src/resources/gifts/GiftService.ts

import { MongoError } from "mongodb";
import { uploadImageToFirebase } from "../../firebase/fileUpload";
import { BadRequestException, InternalServerException } from "../../middleware/HttpException";
import GiftDataAccess from "./GiftDataAccess";
import GiftModel from "./GiftModel";

const giftDataAccess = new GiftDataAccess();

export async function getAllGifts() {
  return giftDataAccess.FindAllGifts({deleted:false});
}

export async function getGiftById(id: string) {
  return giftDataAccess.FindById(id);
}

export async function deleteGiftById(id: string) {
  return giftDataAccess.DeleteGiftById(id);
}

export async function markGiftAsDeleted(id: string) {
  return giftDataAccess.UpdateGift(id,{deleted: true});
}

export async function addGift(gift: GiftModel) {
  // Check if user with this username or email already exists
  const existingGifts = await giftDataAccess.FindAllGifts({
       gift_name: gift.gift_name 
  });

  if (existingGifts.length > 0) {
    throw new BadRequestException("Gift with this name already exists.");
  }
    // Insert the new gift into the database
  return giftDataAccess.InsertOne(gift);
}

export async function uploadImageToFirebaseAndUpdateGift(
  file: Express.Multer.File,
  filePath: string,
  giftId: string
) {
  const image_URL = await uploadImageToFirebase(file, filePath);
  return giftDataAccess.UpdateGift(giftId, { image_URL });
}

export async function UpdateGift(id: string, updatedGift: GiftModel) {
  return giftDataAccess.UpdateGift(id, updatedGift);
}

export async function UpdateGiftDetails(id: string, giftDetails: GiftModel, file?: Express.Multer.File) {
  // If a file is provided, upload it and update photo_URL
  if (file) {
    try {
      const filePath = `usersimages/${id}`;
      giftDetails.image_URL = await uploadImageToFirebase(file, filePath);
    } catch (error) {
      throw new InternalServerException("Error uploading image: " + error);
    }
  }
  try {
    const res =  await giftDataAccess.UpdateGift(id, giftDetails);
    return res
  } catch (error) {    
    if (error instanceof MongoError && error.code === 11000) {
      // This error code stands for 'Duplicate Key Error'
      const keyValue = (error as any).keyValue;
      throw new BadRequestException(`Gift with this ${Object.keys(keyValue)[0]} already exists.`);
    }   
    throw new BadRequestException("Error updating user details: "+  error);
  }
}
