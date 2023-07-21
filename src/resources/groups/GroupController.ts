import { Request, Response, NextFunction } from "express";
import * as GroupService from './GroupService';
import GroupModel from "./GroupModel";
import { NotFoundException } from '../../middleware/HttpException';


export async function getAllGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const groups = await GroupService.getAllGroups();
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
    const newGroup = new GroupModel(req.body);
    console.log(newGroup);    

    const groupInsertion = await GroupService.addGroup(newGroup);
    let savedGroup = groupInsertion.insertedId;
    if (req.file) {
      const filePath = `groupsimages/${groupInsertion.insertedId}`;
      console.log(req.file);
      await GroupService.uploadImageToFirebaseAndUpdateGroup(req.file, filePath, savedGroup);
      savedGroup = await GroupService.getGroupById(savedGroup); // Get updated user
    }
    res.status(201).json({ status: true, data: savedGroup });
  } catch (err) {
    next(err);
  }
}
