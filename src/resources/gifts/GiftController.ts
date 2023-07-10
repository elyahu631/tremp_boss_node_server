// src/resources/gifts/GiftController.ts

import { Request, Response } from "express";
import * as GiftService from './GiftService';
import GiftModel from "./GiftModel";

export async function getAllGifts(req: Request, res: Response): Promise<Response> {
  try {
    
    const gifts = await GiftService.getAllGifts();
    return res.status(200).json(gifts);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getGiftById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const gift = await GiftService.getGiftById(id);
    return res.status(200).json(gift);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteGiftById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    await GiftService.deleteGiftById(id);
    return res.status(200).json({ message: "Gift successfully deleted" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function markGiftAsDeleted(req: Request,res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    await GiftService.markGiftAsDeleted(id);
    return res
      .status(200)
      .json({ message: "Gift deletion status successfully updated" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


export async function addGift(req: Request,res: Response): Promise<Response> {
  try {
    const newGift= new GiftModel(req.body);
    let giftInsertion = await GiftService.addGift(newGift);
    let savedGift = giftInsertion.insertedId;
    if (req.file) {
      const filePath = `giftsimages/${giftInsertion.insertedId}`;
      await GiftService.uploadImageToFirebaseAndUpdateGift(req.file, filePath, savedGift);
      savedGift = await GiftService.getGiftById(savedGift); // Get updated gift
    }
    return res.status(201).json(savedGift);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

export async function updateGiftDetails(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const giftDetails = req.body;
    console.log(giftDetails);
    const updatedGift = await GiftService.UpdateGiftDetails(id, giftDetails, req.file);
    console.log(updatedGift);
    return res.status(200).json([updatedGift, { message: "gift updated successfully" }]);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}