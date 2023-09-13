import { ObjectId } from "mongodb";
import { uploadImageToFirebase } from "../../firebase/fileUpload";
import { BadRequestException } from "../../middleware/HttpException";
import GroupRequestDataAccess from "./GroupRequestDataAccess";
import GroupRequestModel from "./GroupRequestModel";
import UserDataAccess from "../users/UserDataAccess";
import GroupDataAccess from "../groups/GroupDataAccess";
import GroupModel from '../groups/GroupModel';
import { getCurrentTimeInIsrael } from "../../services/TimeService";
import UserGroupsModel from "../usersGroups/UserGroupsModel";
import UserGroupsDataAccess from "../usersGroups/UserGroupsDataAccess";
import { sendNotificationToUser } from "../../services/sendNotification";

const groupReqDataAccess = new GroupRequestDataAccess();
const groupDataAccess = new GroupDataAccess();
const userDataAccess = new UserDataAccess();
const userGroupsDataAccess = new UserGroupsDataAccess();


export async function addGroupRequest(groupReq: GroupRequestModel) {

  // Check if group with this name already exists
  const existingReqGroups = await groupReqDataAccess.FindAllGroupReq({
    group_name: groupReq.group_name
  });

  const existingGroups = await groupDataAccess.FindAllGroups({
    group_name: groupReq.group_name
  });

  if (existingReqGroups.length > 0 || existingGroups.length > 0) {
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

export async function getUserRequests(userId: string) {
  return groupReqDataAccess.FindAllGroupReq({ user_id: new ObjectId(userId) });
}



// admin
export async function getUnapprovedRequests() {
  const unapprovedRequests = await groupReqDataAccess.FindAllGroupReq({ is_approved: { $in: ['pending', 'denied'] } });
  const populatedRequests = [];

  for (const request of unapprovedRequests) {
    const user = await userDataAccess.FindById(request.user_id.toString());
    populatedRequests.push({
      ...request,
      requester_name: user ? user.first_name + ' ' + user.last_name : 'Unknown User',
      requester_email: user ? user.email : 'Unknown Email',
    });
  }
  return populatedRequests;
}


//approveOpenGroupRequest
export async function approveOpenGroupRequest(id: string) {
  const groupRequest = await findAndApproveGroupRequest(id);
  const newGroupId = await createAndValidateNewGroup(groupRequest);
  const fcmToken = await updateUserGroupMembership(groupRequest.user_id.toString(), newGroupId);
  await createApprovedConnectionRequest(groupRequest.user_id.toString(), newGroupId);
  await notifyUser(fcmToken, newGroupId, groupRequest.group_name);
}
// Find and approve the group request
async function findAndApproveGroupRequest(id: string) {
  const groupRequest = await groupReqDataAccess.FindById(id);
  if (!groupRequest) {
    throw new BadRequestException('Group Request not found');
  }
  await groupReqDataAccess.UpdateGroup(id, { is_approved: 'approved' });
  return groupRequest;
}
// Create and validate a new group
async function createAndValidateNewGroup(groupRequest: any) {
  const newGroupData: Partial<GroupModel> = {
    group_name: groupRequest.group_name,
    description: groupRequest.description ?? '',
    type: groupRequest.type,
    image_URL: groupRequest.image_URL ?? '',
    locations: groupRequest.locations,
    admins_ids: [groupRequest.user_id],
    active: 'active',
    deleted: false,
  };

  const newGroup = new GroupModel(newGroupData);
  newGroup.validateGroup();
  
  const res = await groupDataAccess.InsertOne(newGroup);
  return res.insertedId;
}

// Update the user's group membership
async function updateUserGroupMembership(userId: string, newGroupId: string) {
  const user = await userDataAccess.FindById(userId);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  const updatedUserGroups = [...user.groups, new ObjectId(newGroupId)];
  await userDataAccess.Update(userId, { groups: updatedUserGroups });

  return user.notification_token;
}
// Create approved connection request
async function createApprovedConnectionRequest(userId: string, newGroupId: string) {
  const newConnectionRequestData: Partial<UserGroupsModel> = {
    user_id: new ObjectId(userId),
    group_id: new ObjectId(newGroupId),
    request_date: getCurrentTimeInIsrael(),
    is_approved: 'approved'
  };

  const newConnectionRequest = new UserGroupsModel(newConnectionRequestData);
  newConnectionRequest.validateUserGroupReq();
  await userGroupsDataAccess.InsertOne(newConnectionRequest);
}
// Send notification to user
async function notifyUser(fcmToken: string, newGroupId: string, groupName: string) {
  if (fcmToken) {
    const notificationTitle = `Group Opened: ${groupName}`;
    const notificationBody = `The group "${groupName}" is now open and you have been added as an admin.`;
    await sendNotificationToUser(fcmToken, notificationTitle, notificationBody, newGroupId.toString);
  } else {
    console.log('User does not have a valid FCM token');
  }
}


export async function denyOpenGroupRequest(id: string) {
  const groupRequest = await groupReqDataAccess.FindById(id);
  if (!groupRequest) {
    throw new BadRequestException('Group Request not found');
  }
  await groupReqDataAccess.UpdateGroup(id, { is_approved: 'denied' });
}
