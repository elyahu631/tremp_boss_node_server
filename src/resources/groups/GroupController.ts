import { Request, Response } from "express";
import * as GroupService from './GroupService';
import GroupModel from "./GroupModel";

export async function getAllGroups(req: Request, res: Response): Promise<Response> {
  try {
    const groups = await GroupService.getAllGroups();
    return res.status(200).json(groups);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getGroupById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const group = await GroupService.getGroupById(id);
    return res.status(200).json(group);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteGroupById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    await GroupService.deleteGroupById(id);
    return res.status(200).json({ message: "Group successfully deleted" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function markGroupAsDeleted(req: Request,res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    await GroupService.markGroupAsDeleted(id);
    return res.status(200).json({ message: "Group deletion status successfully updated" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


export async function updateGroupDetails(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const groupDetails = req.body;
    const updatedGroup = await GroupService.updateGroupDetails(id, groupDetails);
    return res.status(200).json([updatedGroup, { message: "Group updated successfully" }]);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


export async function addGroup(req: Request,res: Response): Promise<Response> {
  try {
    console.log(req.body);
    const newGroup= new GroupModel(req.body);
    const groupInsertion = await GroupService.addGroup(newGroup);
    let savedGroup = groupInsertion.insertedId;
    if (req.file) {
      const filePath = `groupsimages/${groupInsertion.insertedId}`;
      await GroupService.uploadImageToFirebaseAndUpdateUser(req.file, filePath, savedGroup);
      savedGroup = await GroupService.getGroupById(savedGroup); // Get updated user
    }
    return res.status(201).json(savedGroup);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}