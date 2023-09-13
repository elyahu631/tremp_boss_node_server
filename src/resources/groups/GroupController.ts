import { Request, Response, NextFunction } from "express";
import * as GroupService from './GroupService';
import { BadRequestException, NotFoundException } from '../../middleware/HttpException';

export async function getGroupsUserNotConnected(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id,type} = req.body;
    const groups = await GroupService.getGroupsUserNotConnected(user_id,type);
    res.status(200).json({ status: true, data: groups });
  } catch (err) {
    next(err);
  }
}

export async function getGroupById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const group = await GroupService.getGroupById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    res.status(200).json({ status: true, data: group });
  } catch (err) {
    next(err);
  }
}

export async function getConnectedGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id } = req.params;
    const groups = await GroupService.getConnectedGroups(user_id);
    res.status(200).json({ status: true, data: groups });
  } catch (err) {
    next(err);
  }
}

export async function addGroupToUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id,group_id } = req.body;
    const message  = await GroupService.addGroupToUser(user_id,group_id);
    res.status(200).json({ status: true, message: message  });
  } catch (err) {
    next(err);
  }
}

export async function removeGroupFromUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, group_id } = req.body;
    const message = await GroupService.removeGroupFromUser(user_id, group_id);
    res.status(200).json({ status: true, message: message });
  } catch (err) {
    next(err);
  }
}
export async function allGroupsWithUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {user_id } = req.body;
    const data = await GroupService.allGroupsWithUserStatus(user_id);
    res.status(200).json({ status: true, data });
  } catch (err) {
    next(err);
  }
}
export async function addAdminToGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {admin_id, new_admin_email, group_id } = req.body;
    const message = await GroupService.addAdminToGroup(admin_id,new_admin_email, group_id);
    res.status(200).json({ status: true, message: message });
  } catch (err) {
    next(err);
  }
}



export async function updateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, group_id, group_name, locations, active } = req.body;
    const updateData = { group_name, locations, active };
    const updatedGroup = await GroupService.updateGroup(group_id, user_id, updateData);
    res.status(200).json({ status: true, data: updatedGroup });
  } catch (err) {
    next(err);
  }
}

export async function uploadGroupImage(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    const imageUrl = await GroupService.uploadGroupImage(id, file);
    res.status(200).json({ status: true, message: "Image uploaded successfully", data: {image_URL: imageUrl}});
  } catch (err) {
    next(err);
  }
}







//admin
export async function getAllGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const groups = await GroupService.getAllGroups();
    res.status(200).json({ status: true, data: groups });
  } catch (err) {
    next(err);
  }
}
export async function deleteGroupById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await GroupService.deleteGroupById(id);
    res.status(200).json({ status: true, message: "Group successfully deleted" });
  } catch (err) {
    next(err);
  }
}
export async function markGroupAsDeleted(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await GroupService.markGroupAsDeleted(id);
    res.status(200).json({ status: true, message: "Group deletion status successfully updated" });
  } catch (err) {
    next(err);
  }
}
export async function updateGroupDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const groupDetails = req.body;
    const updatedGroup = await GroupService.updateGroupDetails(id, groupDetails,req.file);
    res.status(200).json({ status: true, data: updatedGroup, message: "Group updated successfully" });
  } catch (err) {
    next(err);
  }
}

export async function addGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const savedGroup = await GroupService.addGroup(req.body, req.file);
    res.status(201).json({ status: true, data: savedGroup });
  } catch (err) {
    next(err);
  }
}