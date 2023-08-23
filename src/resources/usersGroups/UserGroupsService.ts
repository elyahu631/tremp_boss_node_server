import { BadRequestException, NotFoundException, UnauthorizedException } from "../../middleware/HttpException";
import GroupDataAccess from "../groups/GroupDataAccess";
import UserDataAccess from "../users/UserDataAccess";
import UserGroupsDataAccess from "./UserGroupsDataAccess";
import UserGroupsModel from "./UserGroupsModel";
import { AnyBulkWriteOperation, ObjectId } from 'mongodb';

const userGroupsDataAccess = new UserGroupsDataAccess();
const userDataAccess = new UserDataAccess();
const groupDataAccess = new GroupDataAccess();

// export async function requestToJoinGroup(userGroupReq: UserGroupsModel) {
//   return userGroupsDataAccess.InsertOne(userGroupReq);
// }

function assertUserHasGroups(user: any) {
  if (!user || !user.groups) {
    throw new NotFoundException("User not found or user has no groups.");
  }
}

export async function approveGroupRequest(adminId: string, reqId: string, isApproved: string) {
  const join_group_request = await userGroupsDataAccess.FindById(adminId)
  const group = await groupDataAccess.FindById((join_group_request.group_id).toString());

  // Check if group ID is valid
  if (!group || group.deleted) {
    throw new NotFoundException("Group not found or deleted.");
  }

  if (!group.admin_ids.includes(new ObjectId(adminId))) {
    throw new UnauthorizedException("User not Unauthorized to approve users in group")
  }

  // Update the request status to the provided status
  const updateData = {
    is_approved: isApproved,
  };

  await userGroupsDataAccess.UpdateUserGroups(reqId, updateData);
  const user = await userDataAccess.FindById(join_group_request.user_id);
  assertUserHasGroups(user);
  user.groups.push(new ObjectId(group._id));
  return await userDataAccess.UpdateUserDetails((user._id).toString(), user);
}

export async function getRequestsByGroupId(groupId: string) {
  return await userGroupsDataAccess.FindAllUserGroups({
    group_id: new ObjectId(groupId),
    is_approved: 'pending',
  });
}

// export async function getUsersByGroupId(groupId: ObjectId) {
//   return userDataAccess.FindAllUsers({ groups: groupId }, { first_name: 1, last_name: 1 });
// }

export async function getUsersByGroupId(groupId: ObjectId) {
  const usersGroupReq = await userGroupsDataAccess.FindAllUserGroups({ group_id: groupId }, { user_id: 1 })
  const userIds = usersGroupReq.map((req: any) => req.user_id);
  return userDataAccess.FindAllUsers({ _id: { $in: userIds } }, { first_name: 1, last_name: 1 });
}

export async function deleteRequestByUserAndGroup(userId: string, groupId: string) {
  const query = {
    user_id: new ObjectId(userId),
    group_id: new ObjectId(groupId),
  };

  const userGroupRequest = (await userGroupsDataAccess.FindAllUserGroups(query))[0];
  
  if (!userGroupRequest) {
    throw new NotFoundException("Request not found.");
  }

  if (userGroupRequest.is_approve !== "pending") {
    throw new BadRequestException("Request can't be deleted.");
  }

  await userGroupsDataAccess.DeleteById(userGroupRequest._id.toString());
}
