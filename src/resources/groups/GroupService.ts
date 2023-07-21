import GroupDataAccess from "./GroupDataAccess";
import GroupModel from "./GroupModel";
import { uploadImageToFirebase } from '../../firebase/fileUpload';
import { BadRequestException, InternalServerException } from "../../middleware/HttpException";
import { MongoError } from "mongodb";

const groupDataAccess = new GroupDataAccess();

export async function getAllGroups() {
  return groupDataAccess.FindAllGroups({deleted:false, type: { $ne: "GENERAL" }});
}

export async function getGroupById(id: string) {
  return groupDataAccess.FindById(id);
}

export async function deleteGroupById(id: string) {
  return groupDataAccess.DeleteGroupById(id);
}

export async function markGroupAsDeleted(id: string) {
  return groupDataAccess.UpdateGroup(id,{deleted: true});
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
    const res =  await groupDataAccess.UpdateGroup(id, groupDetails);
    return res
  } catch (error) {    
    if (error instanceof MongoError && error.code === 11000) {
      // This error code stands for 'Duplicate Key Error'
      const keyValue = (error as any).keyValue;
      throw new BadRequestException(`group with this ${Object.keys(keyValue)[0]} already exists.`);
    }   
    throw new BadRequestException("Error updating user details: "+  error);
  }
}


export async function uploadImageToFirebaseAndUpdateGroup(file: Express.Multer.File,filePath: string,groupId: string
) {
  const image_URL = await uploadImageToFirebase(file, filePath);
  return groupDataAccess.UpdateGroup(groupId, { image_URL });
}
