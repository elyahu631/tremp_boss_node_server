import { Request, Response, NextFunction } from "express";
import * as UserGroupsService from './UserGroupsService';
import UserGroupsModel from "./UserGroupsModel";

// export async function requestJoinGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
//   try {
//     const userGroupReq = new UserGroupsModel(req.body);
//     const request = await UserGroupsService.requestToJoinGroup(userGroupReq);
//     res.status(201).json({ status: true, data: request });
//   } catch (error: any) {
//     next();
//   }
// }

export async function approveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {admin_id,req_id,is_approved} = req.body; 

    await UserGroupsService.approveGroupRequest(admin_id,req_id, is_approved);

    res.status(200).json({ status: true, message: "Request successfully approved" });
  } catch (error: any) {
    next();
  }
}

export async function getGroupRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { group_id } = req.body;

    const requests = await UserGroupsService.getRequestsByGroupId(group_id);

    res.status(200).json({ status: true, Data:requests });
  } catch (error: any) {
    next();
  }
}

export async function getUsersByGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const groupId = req.body.group_id;

    const users = await UserGroupsService.getUsersByGroupId(groupId);

    res.status(200).json({ status: true, users });
  } catch (error: any) {
    next();
  }
}