// src/resources/tremps/trempControler.ts

import { NextFunction, Request, Response } from "express";
import * as TrempService from "./TrempService";
import * as UserService from "../users/UserService";
import { BadRequestException, NotFoundException } from '../../middleware/HttpException';
import { sendNotificationToUser } from '../../services/sendNotification';
import { getCurrentTimeInIsrael } from "../../services/TimeService";

export async function createTremp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await TrempService.createTremp(req.body);
    res.status(201).json({ status: true, message: 'tremp created successfully' });
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
    const { tremp_id, user_id,participants_amount} = req.body;
    if (!tremp_id || !user_id) {
      throw new BadRequestException('Tremp ID and User ID are required');
    }
    await TrempService.joinToTremp(tremp_id, user_id,participants_amount);
    res.status(200).json({ status: true, message: 'User successfully added to the tremp' });
  } catch (err) {
    next(err);
  }
}

export async function approveUserInTremp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tremp_id, creator_id, user_id, approval } = req.body;
    if (approval !== "approved" && approval !== "denied"){
      throw new BadRequestException('invalid approval');
    }

    await TrempService.approveUserInTremp(tremp_id, creator_id, user_id, approval);

    const user_in_tremp = await UserService.getUserById(user_id);
    
    const fcmToken = user_in_tremp.notification_token;
    if (fcmToken) {
      await sendNotificationToUser(fcmToken, `The creator ${approval}`, 
      `The creator of the ride ${approval} your request`, { creator_id, tremp_id, user_id });
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
    const { user_id, tremp_type } = req.body;
    if (!user_id || !tremp_type) {
      throw new BadRequestException('User ID and type of ride are required');
    }
    const tremps = await TrempService.getUserTremps(user_id, tremp_type);
    if (!tremps) {
      throw new NotFoundException("No Tremps found for this user and ride type");
    }
    res.status(200).json({ status: true, data: tremps });
  } catch (err) {
    next(err);
  }
}

export async function getUsersInTremp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trempId = req.params.tremp_id;
    const users = await TrempService.getUsersInTremp(trempId);
    res.status(200).json({ status: true, data: users });
  } catch (error) {
    next(error);
  }
};

export async function deleteTremp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tremp_id, user_id } = req.body;
    if (!tremp_id || !user_id) {
      throw new BadRequestException('Tremp ID and User ID are required');
    }
    const result = await TrempService.deleteTremp(tremp_id, user_id);
    res.status(200).json({ status: true, result });
  } catch (err) {
    next(err);
  }
}

export async function getApprovedTremps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, tremp_type } = req.body;
    if (!user_id || !tremp_type) {
      throw new BadRequestException('User ID and type of ride are required');
    }
    const approvedTremps = await TrempService.getApprovedTremps(user_id, tremp_type);
    if (!approvedTremps) {
      throw new NotFoundException("No Tremps found for this user and ride type");
    }
    res.status(200).json({ status: true, data:{approved_tremps:approvedTremps} });
  } catch (err) {
    next(err);
  }
}

export async function trempCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tremp_id, user_id } = req.body;
    if (!tremp_id || !user_id) {
      throw new BadRequestException('Tremp ID and User ID are required');
    }
    const result = await TrempService.trempCompleted(tremp_id, user_id);
    res.status(200).json({ status: true, result });
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


export async function getTrempHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {user_id,tremp_type} = req.body;
    const tremps = await TrempService.getTrempsHistory(user_id,tremp_type);
    res.status(200).json({ status: true, data: tremps });
  } catch (err) {
    next(err);
  }
}

export async function getTremp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {

    const tremps = await TrempService.getTremp();
    res.status(200).json({ status: true, data: tremps });
  } catch (err) {
    next(err);
  }
}

export async function checkNotificationsForUpcomingTremps(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        await TrempService.notifyForUpcomingTremps();
        res.status(200).json({ status: true, message: 'Checked for upcoming tremps and sent notifications.' });
    } catch (err) {
        next(err);
    }
}


