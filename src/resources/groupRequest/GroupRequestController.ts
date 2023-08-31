import { Request, Response, NextFunction } from "express";
import * as GroupRequestService from './GroupRequestService';
import GroupRequestModel from "./GroupRequestModel";
import { BadRequestException } from "../../middleware/HttpException";

export async function addGroupRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const newOpenGroup = new GroupRequestModel(req.body);
    const savedOpenGroup = await GroupRequestService.addGroupRequest(newOpenGroup);
    res.status(201).json({ status: true, data: savedOpenGroup });
  } catch (err) {
    next(err);
  }
}

export async function uploadGroupRequestImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let file: Express.Multer.File;

    if (Array.isArray(req.files)) {
      file = req.files[0];
    } else {
      file = req.files[Object.keys(req.files)[0]][0];
    }

    if (!file) {
      throw new BadRequestException('No image provided.');
    }

    const { id } = req.params;
    const imageUrl = await GroupRequestService.uploadGroupRequestImage(id, file);
    res.status(200).json({ status: true, message: "Image uploaded successfully", data: {image_URL: imageUrl}});
  } catch (err) {
    next(err);
  }
}

export async function getUserRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id } = req.body;
    const userRequests = await GroupRequestService.getUserRequests(user_id);
    res.status(200).json({ status: true, data: userRequests });
  } catch (err) {
    next(err);
  }
}




export async function getUnapprovedRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const unapprovedRequests = await GroupRequestService.getUnapprovedRequests();
    res.status(200).json({ status: true, data: unapprovedRequests });
  } catch (err) {
    next(err);
  }
}


// GroupRequestController.ts

export async function approveOpenGroupRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await GroupRequestService.approveOpenGroupRequest(id);
    res.status(200).json({ status: true, message: 'Request approved successfully.' });
  } catch (err) {
    next(err);
  }
}



// GroupRequestController.ts

export async function denyOpenGroupRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await GroupRequestService.denyOpenGroupRequest(id);
    res.status(200).json({ status: true, message: 'Request denied successfully.' });
  } catch (err) {
    next(err);
  }
}
