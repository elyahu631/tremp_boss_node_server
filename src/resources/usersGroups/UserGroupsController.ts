import { Request, Response, NextFunction } from "express";
import * as UserGroupsService from './UserGroupsService';


export async function approveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {admin_id,req_id,is_approved} = req.body; 

    await UserGroupsService.approveGroupRequest(admin_id,req_id, is_approved);

    res.status(200).json({ status: true, message: "Request successfully approved" });
  } catch (error: any) {
    next(error);
  }
}

export async function deleteGroupRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, group_id } = req.body;

    await UserGroupsService.deleteRequestByUserAndGroup(user_id, group_id);

    res.status(200).json({ status: true, message: "Request successfully deleted" });
  } catch (error: any) {
    next(error);
  }
}

export async function getUsersRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, group_id } = req.body;

    const connected = await UserGroupsService.getUsersRequest(user_id, group_id, 'approved');
    const pending = await UserGroupsService.getUsersRequest(user_id, group_id, 'pending');

    res.status(200).json({ status: true, connected, pending });
  } catch (error: any) {
    next(error);
  }
}





