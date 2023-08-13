// src/resources/tremps/trempService.ts
import TrempModel from './TrempModel';
import TrempDataAccess from './TrempDataAccess';
import UserDataAccess from '../users/UserDataAccess';
import { ObjectId } from 'mongodb';
import { Tremp, UserInTremp } from './TrempInterfaces';
import { sendNotificationToUser } from '../../services/sendNotification';
import { BadRequestException, NotFoundException } from '../../middleware/HttpException';

const trempDataAccess = new TrempDataAccess();
const userDataAccess = new UserDataAccess();

const validateTrempData = (tremp: TrempModel) => {
  tremp.validateTremp();

  const { creator_id, tremp_time, from_route, to_route } = tremp;

  if (!creator_id || !tremp_time || !from_route || !to_route) {
    throw new Error("Missing required tremp data");
  }

  if (new Date(tremp_time) < new Date()) {
    throw new Error("Tremp time has already passed");
  }

  if (from_route.name === to_route.name) {
    throw new Error("The 'from' and 'to' locations cannot be the same");
  }
}

export async function createTremp(tremp: TrempModel) {
  validateTrempData(tremp);
  tremp.creator_id = new ObjectId(tremp.creator_id)
  tremp.group_id = new ObjectId(tremp.group_id)
  tremp.tremp_time = new Date(tremp.tremp_time)
  const user = await userDataAccess.FindById(tremp.creator_id.toString());
  if (!user) {
    throw new NotFoundException("Creator user does not exist");
  }
  return await trempDataAccess.insertTremp(tremp);
}

export async function getAllTremps() {
  return trempDataAccess.FindAll({deleted:false}); 
}

export async function getTrempsByFilters(filters: any) {
  const userId = new ObjectId(filters.creator_id);
  const date = new Date(filters.tremp_time)
  const query = {
    deleted: false,
    is_full: false,
    creator_id: { $ne: userId },
    tremp_time: { $gt: date},
    tremp_type: filters.tremp_type,
    users_in_tremp: {
      $not: {
        $elemMatch: { user_id: userId }
      }
    },
  };

  let tremps = await trempDataAccess.FindTrempsByFilters(query);

  // Get all unique user IDs
  let uniqueUserIds = [...new Set(tremps.map(tremp => new ObjectId(tremp.creator_id)))];//
  console.log(uniqueUserIds);

  // Fetch all users in one operation
  let users = await userDataAccess.FindAllUsers(
    { _id: { $in: uniqueUserIds } },
    { first_name: 1, last_name: 1, image_URL: 1 }
  );

  console.log(users);

  // Convert users array to a map for efficient access
  let usersMap = new Map(users.map(user => [user._id.toString(), user]));

  // Add user details to tremps
  tremps.forEach(tremp => {
    let user = usersMap.get(tremp.creator_id.toString());
    if (user) {
      tremp.creator = {
        first_name: user.first_name,
        last_name: user.last_name,
        image_URL: user.image_URL
      };
    }
  });

  return tremps;
}

export async function addUserToTremp(tremp_id: string, user_id: string) {
  let id = new ObjectId(user_id);
  const user = { user_id: id, is_approved: "pending" };
  const query = ({ $push: { users_in_tremp: user } });
  const updatedTremp = await trempDataAccess.addUserToTremp(tremp_id, query)
  if (updatedTremp.matchedCount === 0) {
    throw new NotFoundException('Tremp not found');
  }
  if (updatedTremp.modifiedCount === 0) {
    throw new BadRequestException('User not added to the tremp');
  }
    const tremp = await trempDataAccess.FindByID(tremp_id);
    const creatorId = tremp.creator_id;
    const creator = await userDataAccess.FindById(creatorId);
    const fcmToken = creator.notification_token;
    if (fcmToken) {
      await sendNotificationToUser(fcmToken, 'New User Joined Drive',
       'A user has joined your drive.', { tremp_id, user_id });
    } else {
      console.log('User does not have a valid FCM token');
    }
}

export async function approveUserInTremp(tremp_id: string, creator_id: string, user_id: string, approval: boolean): Promise<any> {
  // Fetch the tremp using tremp_id

  const tremp = await trempDataAccess.FindByID(tremp_id);
  // Check if the tremp exists
  if (!tremp) {
    throw new Error('Tremp does not exist');
  }

  // Check if the user making the request is the creator of the tremp
  if (tremp.creator_id.toString() !== creator_id) {
    throw new Error('Only the creator of the tremp can approve or disapprove participants');
  }
  // Find the user in the tremp
  const userIndex = tremp.users_in_tremp.findIndex((user: any) => user.user_id.toString() === user_id);
  // Check if the user is a participant in the tremp
  if (userIndex === -1) {
    throw new Error('User is not a participant in this tremp');
  }
  // Update the user's approval status
  tremp.users_in_tremp[userIndex].is_approved = approval ? "approved" : "denied";
  // Update the tremp in the database
  const result = await trempDataAccess.Update(tremp_id, tremp);
  return result;
}

export async function getTrempById(id: string) {
  return trempDataAccess.FindByID(id);
}

const mapTrempWithoutUsersInTremp = (tremp: Tremp, approvalStatus: string) => {
  const { users_in_tremp, ...otherProps } = tremp;
  return { ...otherProps, approvalStatus };
};

export async function getUserTremps(user_id: string, tremp_type: string) {
  const userId = new ObjectId(user_id);
  const first = tremp_type === 'driver' ? 'driver': 'hitchhiker' ;
  const second = tremp_type === 'hitchhiker' ? 'driver': 'hitchhiker' ;

  const driverQuery = {
    creator_id: userId,
    tremp_type: first,
    deleted: false
  };

  const hitchhikerQuery = {
    "users_in_tremp.user_id": userId,
    tremp_type: second,
    deleted: false
  };

  const driverTremps: Tremp[] = await trempDataAccess.FindAll(driverQuery) as any;

  const driverTrempsMapped = driverTremps.map(tremp => {
    const approvalStatus = getApprovalStatus(tremp, userId, first);
    return mapTrempWithoutUsersInTremp(tremp, approvalStatus);
  });

  const hitchhikerTremps: Tremp[] = await trempDataAccess.FindAll(hitchhikerQuery) as any;

  const hitchhikerTrempsMapped = hitchhikerTremps.map(tremp => {
    const approvalStatus = getApprovalStatus(tremp, userId, second);
    return mapTrempWithoutUsersInTremp(tremp, approvalStatus);
  });

  const tremps = [...driverTrempsMapped, ...hitchhikerTrempsMapped];

  return tremps;
}

function getApprovalStatus(tremp: Tremp, userId: ObjectId, tremp_type: string): string {
  const isCreator = tremp.creator_id.equals(userId);
  const userInTremp = tremp.users_in_tremp.find((user: UserInTremp) => user.user_id.equals(userId));
  const noApplicantsMessage = tremp_type === 'driver' ? 'no applicants' : 'no bidders';
  const awaitingApprovalMessage = 'awaiting approval from me';
  const allApprovedMessage = 'all approved';

  // Check if the user is the creator
  if (isCreator) {
    console.log('User is the creator');
    if (tremp.users_in_tremp.length === 0) {
      return noApplicantsMessage;
    } else {
      const pending = tremp.users_in_tremp.some((user: UserInTremp) => user.is_approved === 'pending');
      const denied = tremp.users_in_tremp.every((user: UserInTremp) => user.is_approved === 'denied');
      if (pending) return awaitingApprovalMessage;
      if (denied) return noApplicantsMessage;
      return allApprovedMessage;
    }
  }

  // Check if the user is in users_in_tremp
  if (userInTremp) {
    console.log('User is in users_in_tremp');
    switch (userInTremp.is_approved) {
      case 'pending':
        return tremp_type === 'driver' ? 'waiting for approval from driver' : 'waiting for approval from hitchhiker';
      case 'denied':
        return 'not approved';
      case 'approved':
        return 'approved';
      default:
        return 'not involved';
    }
  }

  console.log('User is neither the creator nor in users_in_tremp');
  return 'not involved'; // default value, if none of the conditions are met
}


export async function deleteTremp(tremp_id: string, user_id: string) {
  const userId = new ObjectId(user_id);
  const tremp = await trempDataAccess.FindByID(tremp_id);
  // Check if the tremp exists
  if (!tremp) {
    throw new Error('Tremp does not exist');
  }
  // Check if the user requesting the delete is the creator of the tremp
  if (!tremp.creator_id.equals(userId)) {
    throw new Error('Only the creator of the tremp can delete it');
  }
  
  // Find users in the tremp who need to be notified
  const usersToNotify = tremp.users_in_tremp.filter((user: UserInTremp) => user.is_approved === 'approved' || 'pending');

  if (usersToNotify.length > 0) {
    // Send notifications to all approved users
    // You'll need to fetch these users from the user database to get their notification tokens
    const userTokens = await userDataAccess.FindAllUsers(
      { _id: { $in: usersToNotify.map((u: UserInTremp) => new ObjectId(u.user_id)) } },
      { notification_token: 1 }
    );
    for (const userToken of userTokens) {
      if (userToken.notification_token) {
        // Use your notification function here
        await sendNotificationToUser(userToken.notification_token, "Tremp cancellation notice",
         "The tremp you joined has been cancelled.", { tremp_id: tremp_id, user_id: user_id });
      }
    }
  }

  // Delete the tremp
  return await trempDataAccess.Update(tremp_id, { deleted: true });
}
