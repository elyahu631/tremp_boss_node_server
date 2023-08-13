// src/resources/tremps/trempControler.ts
import { ObjectId } from 'mongodb';
import { NextFunction, Request, Response } from "express";
import * as TrempService from "./TrempService";
import * as UserService from "../users/UserService";
import TrempModel from "./TrempModel";
import { BadRequestException, NotFoundException } from '../../middleware/HttpException';
import { sendNotificationToUser } from '../../services/sendNotification';



export async function createTremp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const newTremp = new TrempModel(req.body);   
    const result = await TrempService.createTremp(newTremp);
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAllTremps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let trepms = await TrempService.getAllTremps();
    trepms = trepms.map(tremp => ({ ...tremp, password: "user1234" }));
    res.status(200).json({ status: true, data: trepms });
  } catch (err) {
    next(err);
  }
}

export async function getTrempsByFilters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = req.body;
    const tremps = await TrempService.getTrempsByFilters(filters);
    res.status(200).json({ status: true, data: tremps });
  } catch (err) {
    next(err);
  }
}

export async function addUserToTremp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tremp_id, user_id } = req.body;
    if (!tremp_id || !user_id) {
      throw new BadRequestException('Tremp ID and User ID are required');
    }
    await TrempService.addUserToTremp(tremp_id, user_id);
    res.status(200).json({ status: true, message: 'User successfully added to the tremp' });
  } catch (err) {
    next(err);
  }
}

export async function approveUserInTremp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tremp_id, creator_id, user_id, approval } = req.body;
    await TrempService.approveUserInTremp(tremp_id, creator_id, user_id, approval);
    const user_in_tremp = await UserService.getUserById(user_id);
    const fcmToken = user_in_tremp.notification_token;
    const answer = approval ? "approved" : "denied";
    if (fcmToken) {
      await sendNotificationToUser(fcmToken, `The creator ${answer}`, 
      `The creator of the ride ${answer} your request`, { creator_id, tremp_id, user_id });
    } else {
      console.log('User does not have a valid FCM token');
    }
    res.status(200).json({ status: true, message: 'User approval status updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getUserTremps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, type_of_tremp } = req.body;
    if (!user_id || !type_of_tremp) {
      throw new BadRequestException('User ID and type of ride are required');
    }
    const tremps = await TrempService.getUserTremps(user_id, type_of_tremp);
    if (!tremps) {
      throw new NotFoundException("No Tremps found for this user and ride type");
    }
    res.status(200).json({ status: true, data: tremps });
  } catch (err) {
    next(err);
  }
}

export async function deleteTremp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tremp_id, user_id } = req.body;
    if (!tremp_id || !user_id) {
      throw new BadRequestException('Tremp ID and User ID are required');
    }
    const result = await TrempService.deleteTremp(tremp_id, user_id);
    if (result.modifiedCount === 0) {
      throw new BadRequestException('Tremp could not be deleted');
    }
    res.status(200).json({ status: true, message: 'Tremp successfully deleted' });
  } catch (err) {
    next(err);
  }
}
