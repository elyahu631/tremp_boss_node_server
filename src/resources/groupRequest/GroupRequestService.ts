import { uploadImageToFirebase } from "../../firebase/fileUpload";
import { BadRequestException } from "../../middleware/HttpException";
import GroupRequestDataAccess from "./GroupRequestDataAccess";
import GroupRequestModel from "./GroupRequestModel";

const groupReqDataAccess = new GroupRequestDataAccess();

export async function addGroupRequest(groupReq: GroupRequestModel) {
  // Check if group with this name already exists
  const existingGroups = await groupReqDataAccess.FindAllGroupReq({
       group_name: groupReq.group_name 
  });

  if (existingGroups.length > 0) {
    throw new BadRequestException("Group with this name already exists.");
  }

  return groupReqDataAccess.InsertOne(groupReq);
}


export async function uploadGroupRequestImage(id: string, file?: Express.Multer.File) {
  const filePath = `grouprequest/${id}`; 
  const image_URL = await uploadImageToFirebase(file, filePath);
  await groupReqDataAccess.UpdateGroup(id, { image_URL }); 
  return image_URL;
}