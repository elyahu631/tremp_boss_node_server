// src/resources/gifts/GiftService.ts

import { uploadImageToFirebase } from "../../firebase/fileUpload";
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
    throw new Error("Gift with this name already exists.");
  }
  console.log(gift);
  
  // Insert the new gift into the database
  return giftDataAccess.InsertOne(gift);
}

export async function uploadImageToFirebaseAndUpdateGift(
  file: Express.Multer.File,
  filePath: string,
  giftId: string
) {
  const gift_image = await uploadImageToFirebase(file, filePath);
  return giftDataAccess.UpdateGift(giftId, { gift_image });
}

export async function UpdateGift(id: string, updatedGift: GiftModel) {
  return giftDataAccess.UpdateGift(id, updatedGift);
}

export async function UpdateGiftDetails(id: string, giftDetails: GiftModel, file?: Express.Multer.File) {

  // If a file is provided, upload it and update photo_URL
  if (file) {
    try {
      const filePath = `usersimages/${id}`;
      giftDetails.gift_image = await uploadImageToFirebase(file, filePath);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  try {
    return await giftDataAccess.UpdateGift(id, giftDetails);
  } catch (error) {
    console.error("Error updating user details:", error);
    throw (error);
  }
}
