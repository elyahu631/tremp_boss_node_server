// src/resources/gifts/GiftController.ts

import { Request, Response, NextFunction } from "express";
import * as GiftService from './GiftService';
import GiftModel from "./GiftModel";
import { NotFoundException, InternalServerException } from '../../middleware/HttpException';

export async function getAllGifts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const gifts = await GiftService.getAllGifts();
    res.status(200).json({ status: true, data: gifts });
  } catch (error: any) {
    next(new InternalServerException(error.message));
  }
}

export async function getGiftById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const gift = await GiftService.getGiftById(id);
    if (!gift) {
      throw new NotFoundException('Gift not found');
    }
    res.status(200).json({ status: true, data: gift });
  } catch (error: any) {
    next(new InternalServerException(error.message));
  }
}

export async function deleteGiftById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await GiftService.deleteGiftById(id);
    res.status(200).json({ status: true, message: "Gift successfully deleted" });
  } catch (error: any) {
    next(new InternalServerException(error.message));
  }
}

export async function markGiftAsDeleted(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await GiftService.markGiftAsDeleted(id);
    res.status(200).json({ status: true, message: "Gift deletion status successfully updated" });
  } catch (error: any) {
    next(new InternalServerException(error.message));
  }
}

export async function addGift(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const newGift = new GiftModel(req.body);
    console.log(newGift);    
    let giftInsertion = await GiftService.addGift(newGift);
    let savedGift = giftInsertion.insertedId;
    if (req.file) {
      const filePath = `giftsimages/${giftInsertion.insertedId}`;
      await GiftService.uploadImageToFirebaseAndUpdateGift(req.file, filePath, savedGift);
      savedGift = await GiftService.getGiftById(savedGift); // Get updated gift
    }
    res.status(201).json({ status: true, data: savedGift });
  } catch (err) {
    next(err);
  }
}

export async function updateGiftDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const giftDetails = req.body;
    const updatedGift = await GiftService.UpdateGiftDetails(id, giftDetails, req.file);
    res.status(200).json({ status: true, data: updatedGift, message: "Gift updated successfully" });
  } catch (error: any) {
    next(new InternalServerException(error.message));
  }
}