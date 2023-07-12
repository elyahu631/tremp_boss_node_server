import GroupDataAccess from "./GroupDataAccess";
import GroupModel from "./GroupModel";
import { uploadImageToFirebase } from '../../firebase/fileUpload';

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
    throw new Error("Group with this name already exists.");
  }
  
  return groupDataAccess.InsertOne(group);
}

export async function updateGroupDetails(id: string, groupDetails: GroupModel) {
  return await groupDataAccess.UpdateGroup(id, groupDetails);
}

export async function uploadImageToFirebaseAndUpdateUser(file: Express.Multer.File,filePath: string,groupId: string
) {
  const image_URL = await uploadImageToFirebase(file, filePath);
  return groupDataAccess.UpdateGroup(groupId, { image_URL });
}
