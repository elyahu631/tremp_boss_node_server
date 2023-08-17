import GroupDataAccess from "./GroupDataAccess";
import GroupModel from "./GroupModel";
import { ObjectId } from 'mongodb';
import { uploadImageToFirebase } from '../../firebase/fileUpload';
import { BadRequestException, InternalServerException, NotFoundException } from "../../middleware/HttpException";
import { MongoError } from "mongodb";
import UserDataAccess from "../users/UserDataAccess";

const groupDataAccess = new GroupDataAccess();
const userDataAccess = new UserDataAccess();

export async function getGroupById(id: string) {
  return groupDataAccess.FindById(id);
}

function assertUserHasGroups(user: any) {
  if (!user || !user.groups) {
    throw new NotFoundException("User not found or user has no groups.");
  }
}

export async function getGroupsUserNotConnected(userId: string, type: string) {
  const user = await userDataAccess.FindById(userId);

  assertUserHasGroups(user);

  // Create an array of ObjectIds for the user's connected groups
  const userConnectedGroupIds = user.groups.map((group: string) => new ObjectId(group));
  const query = {
    _id: { $nin: userConnectedGroupIds },
    type: type,
    deleted: false,
  };
  const groups = await groupDataAccess.FindAllGroups(query);

  return groups;
}

export async function getConnectedGroups(userId: string) {
  const user = await userDataAccess.FindById(userId);
  assertUserHasGroups(user);
  const userConnectedGroupIds = user.groups.map((group: string) => new ObjectId(group));
  const qeury = { _id: { $in: userConnectedGroupIds } };
  const groups = await groupDataAccess.FindAllGroups(qeury);
  return groups;
}

export async function addGroupToUser(userId: string, groupId: string) {
  const user = await userDataAccess.FindById(userId);

  assertUserHasGroups(user);

  // is group ID is valid
  const groupToAdd = await groupDataAccess.FindById(groupId);
  if (!groupToAdd || groupToAdd.deleted) {
    throw new NotFoundException("Group not found or deleted.");
  }

  // group is already connected to the user
  if (user.groups.some((group: ObjectId) => group.toString() === groupId)) {
    throw new BadRequestException("Group already connected to the user.");
  }

  // Add the group to the user's groups
  user.groups.push(new ObjectId(groupId));
  await userDataAccess.UpdateUserDetails(user._id.toString(),user);

  return groupToAdd;
}

export async function removeGroupFromUser(userId: string, groupId: string): Promise<string> {
  const user = await userDataAccess.FindById(userId);

  assertUserHasGroups(user);

  // Check if group ID is valid
  const groupToRemove = await groupDataAccess.FindById(groupId);
  if (!groupToRemove || groupToRemove.deleted) {
    throw new NotFoundException("Group not found or deleted.");
  }

  // Check if group is connected to the user
  const groupIndex = user.groups.findIndex((group: ObjectId) => group.toString() === groupId);
  if (groupIndex === -1) {
    throw new BadRequestException("Group not connected to the user.");
  }

  // Remove the group from the user's groups
  user.groups.splice(groupIndex, 1);
  await userDataAccess.UpdateUserDetails(user._id.toString(), user);

  return `Successfully disconnected from the group ${groupToRemove.group_name}`;
}







export async function getAllGroups() {
  return groupDataAccess.FindAllGroups({ deleted: false, type: { $ne: "GENERAL" } });
}

export async function deleteGroupById(id: string) {
  return groupDataAccess.DeleteGroupById(id);
}

export async function markGroupAsDeleted(id: string) {
  return groupDataAccess.UpdateGroup(id, { deleted: true });
}

export async function addGroup(group: GroupModel) {
  const existingGroups = await groupDataAccess.FindAllGroups({
    group_name: group.group_name
  });

  if (existingGroups.length > 0) {
    throw new BadRequestException("Group with this name already exists.");
  }

  return groupDataAccess.InsertOne(group);
}


export async function updateGroupDetails(id: string, groupDetails: GroupModel, file?: Express.Multer.File) {
  // If a file is provided, upload it and update photo_URL
  console.log(file);
  if (file) {
    try {
      const filePath = `groupsimages/${id}`;
      groupDetails.image_URL = await uploadImageToFirebase(file, filePath);
    } catch (error) {
      throw new InternalServerException("Error uploading image: " + error);
    }
  }
  try {
    const res = await groupDataAccess.UpdateGroup(id, groupDetails);
    return res
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      // This error code stands for 'Duplicate Key Error'
      const keyValue = (error as any).keyValue;
      throw new BadRequestException(`group with this ${Object.keys(keyValue)[0]} already exists.`);
    }
    throw new BadRequestException("Error updating user details: " + error);
  }
}


export async function uploadImageToFirebaseAndUpdateGroup(file: Express.Multer.File, filePath: string, groupId: string) {
  const image_URL = await uploadImageToFirebase(file, filePath);
  return groupDataAccess.UpdateGroup(groupId, { image_URL });
}
