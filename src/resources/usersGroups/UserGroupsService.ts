import { BadRequestException, NotFoundException, UnauthorizedException } from "../../middleware/HttpException";
import GroupDataAccess from "../groups/GroupDataAccess";
import UserDataAccess from "../users/UserDataAccess";
import UserGroupsDataAccess from "./UserGroupsDataAccess";
import { ObjectId } from 'mongodb';

const userGroupsDataAccess = new UserGroupsDataAccess();
const userDataAccess = new UserDataAccess();
const groupDataAccess = new GroupDataAccess();



function assertUserHasGroups(user: any) {
  if (!user || !user.groups) {
    throw new NotFoundException("User not found or user has no groups.");
  }
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

export async function approveGroupRequest(adminId: string, reqId: string, isApproved: string) {
  const join_group_request = await userGroupsDataAccess.FindById(reqId)
  const group = await groupDataAccess.FindById((join_group_request.group_id).toString());

  // Check if group ID is valid
  if (!group || group.deleted) {
    throw new NotFoundException("Group not found");
  }

  const stringAdminIds = group.admins_ids.map((id: ObjectId) => id.toString());

  if (!stringAdminIds.includes(adminId)) {
    throw new UnauthorizedException("User not Unauthorized to approve users in group");
  }

  if (isApproved !== 'approved' && isApproved !== 'denied') {
    throw new BadRequestException("Invalid status value");
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

export async function getUsersRequest(userId: string, groupId: string, status: string) {
  const query = {
    group_id: new ObjectId(groupId),
    is_approved: status,
  };

  const usersGroupReq = await userGroupsDataAccess.FindAllUserGroups(query);

  // Retrieve the group details to get the list of admin IDs
  const groupDetails = await groupDataAccess.FindById(groupId);

  // Map the user group requests to the desired format
  const usersWithRequests = usersGroupReq.map(async (req: any) => {
    const user = await userDataAccess.FindById(req.user_id);

    let isAdmin = false;

    if (status === 'approved') {
      isAdmin = groupDetails.admins_ids.some((adminId: ObjectId) => adminId.toString() === req.user_id.toString());
    }

    return {
      request: {
        ...req,
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number,
          image_URL: user.image_URL,
          gender: user.gender,
          ...(status === 'approved' && { is_admin: isAdmin })
        },
      },
    };
  });

  // Wait for all promises to complete and return the result
  return await Promise.all(usersWithRequests);
}


