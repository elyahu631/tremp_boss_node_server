import { ObjectId } from 'mongodb';
// src/resources/tremps/trempControler.ts
import { NextFunction, Request, Response } from "express";
import * as TrempService from "./TrempService";
import * as UserService from "../users/UserService";
import TrempModel from "./TrempModel";
import * as admin from 'firebase-admin';
import { FIREBASE_ENV } from "../../config/environment";
import { BadRequestException, NotFoundException } from '../../middleware/HttpException';

admin.initializeApp({
  credential: admin.credential.cert({
    "projectId": FIREBASE_ENV.project_id,
    "privateKey": FIREBASE_ENV.private_key,
    "clientEmail": FIREBASE_ENV.client_email,
  }),
  databaseURL: 'https://fcm.googleapis.com/fcm/send',
});

const validateTrempData = (tremp: TrempModel) => {
  tremp.validateTremp();

  const { creator_id, tremp_time, from_root, to_root } = tremp;

  if (!creator_id || !tremp_time || !from_root || !to_root) {
    throw new Error("Missing required tremp data");
  }

  if (new Date(tremp_time) < new Date()) {
    throw new Error("Tremp time has already passed");
  }

  if (from_root.name === to_root.name) {
    throw new Error("The 'from' and 'to' locations cannot be the same");
  }
}

export async function createTremp(req: Request, res: Response): Promise<Response> {
  try {
    const newTremp = new TrempModel(req.body);
    validateTrempData(newTremp);
    const user = await UserService.getUserById(newTremp.creator_id.toString());
    if (!user) {
      throw new Error("Creator user does not exist");
    }

    newTremp.creator_id = new ObjectId (newTremp.creator_id)
    newTremp.group_id = new ObjectId (newTremp.group_id)

    const result = await TrempService.createTremp(newTremp);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: `Validation failed: ${error.message}` });
  }
}

export async function getTrempsByFilters(req: Request, res: Response): Promise<Response> {
  try {
    const filters = req.body;
    const tremps = await TrempService.getTrempsByFilters(filters);

    return res.status(200).json(tremps);
  } catch (error) {
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

export async function addUserToTremp(req: Request, res: Response): Promise<Response> {
  try {
    const { tremp_id, user_id } = req.body;

    // validate user input
    if (!tremp_id || !user_id) {
      return res.status(400).json({ message: 'Tremp ID and User ID are required' });
    }

    const updatedTremp = await TrempService.addUserToTremp(tremp_id, user_id);
    if (updatedTremp.matchedCount === 0) {
      return res.status(404).json({ message: 'Tremp not found' });
    }
    if (updatedTremp.modifiedCount === 0) {
      return res.status(400).json({ message: 'User not added to the tremp' });
    }

    // Get the creator ID of the tremp
    const tremp = await TrempService.getTrempById(tremp_id);
    const creatorId = tremp.creator_id;

    // Get the creator's FCM token from the database
    const creator = await UserService.getUserById(creatorId);
    const fcmToken = creator.notification_token;

    if (fcmToken) {
      // Send the notification to the creator
      await sendNotificationToUser(fcmToken, tremp_id, user_id);
    } else {
      console.log('User does not have a valid FCM token');
    }

    return res.status(200).json({ message: 'User successfully added to the tremp' });
  } catch (error) {
    return res.status(500).json({ message: `Error adding user to Tremp: ${error.message}` });
  }
}

async function sendNotificationToUser(fcmToken: string, tremp_id: string, user_id: string) {
  const message = {
    token: fcmToken,
    notification: {
      title: 'New User Joined Drive',
      body: 'A user has joined your drive.',
    },
    data: {
      tremp_id,
      user_id,
    },
  };
  await admin.messaging().send(message);
}

export async function approveUserInTremp(req: Request, res: Response): Promise<Response> {
  const { tremp_id, creator_id, user_id, approval } = req.body;
  try {
    await TrempService.approveUserInTremp(tremp_id, creator_id, user_id, approval);
    return res.status(200).json({ message: 'User approval status updated successfully' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}


export async function getUserTremps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, type_of_tremp } = req.body;

    // validate user input
    if (!user_id || !type_of_tremp) {
      throw new BadRequestException('User ID and type of ride are required');
    }

    const tremps = await TrempService.getUserTremps(user_id, type_of_tremp);
    if (!tremps) {
      throw new NotFoundException("No Tremps found for this user and ride type");
    }
    
    res.status(200).json({
      status: true, 
      data: tremps
    });
  } catch (err) {
    next(err);  // Pass the error to handleErrors middleware
  }
}
