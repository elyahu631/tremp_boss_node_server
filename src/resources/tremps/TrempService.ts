// src/resources/tremps/trempService.ts
import TrempModel from './TrempModel';
import TrempDataAccess from './TrempDataAccess';
import UserDataAccess from '../users/UserDataAccess';
import { ObjectId } from 'mongodb';
import { Tremp, UserInTremp, UsersApprovedInTremp } from './TrempInterfaces';
import { sendNotificationToUser } from '../../services/sendNotification';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../../middleware/HttpException';

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

export async function getTrempsByFilters(filters: any) {
  const userId = new ObjectId(filters.creator_id);
  const date = new Date(filters.tremp_time)
  const query = {
    deleted: false,
    is_full: false,
    creator_id: { $ne: userId },
    tremp_time: { $gt: date },
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

export async function addUserToTremp(tremp_id: string, user_id: string,participants_amount: number) {
  let userId = new ObjectId(user_id);
  const participantsAmount = participants_amount ? participants_amount : 1;
  const user = { user_id: userId,participants_amount :participantsAmount, is_approved: "pending" };
  const query = ({ $push: { users_in_tremp: user } });

  const tremp = await trempDataAccess.FindByID(tremp_id);
  const creatorId = tremp.creator_id;

  if (userId.equals(creatorId)) {
    throw new BadRequestException('The creator can not join to tremp');
  }
  const updatedTremp = await trempDataAccess.addUserToTremp(tremp_id, query)
  if (updatedTremp.matchedCount === 0) {
    throw new NotFoundException('Tremp not found');
  }
  if (updatedTremp.modifiedCount === 0) {
    throw new BadRequestException('User not added to the tremp');
  }

  const creator = await userDataAccess.FindById(creatorId);
  const fcmToken = creator.notification_token;
  if (fcmToken) {
    await sendNotificationToUser(fcmToken, 'New User Joined Drive',
      'A user has joined your drive.', { tremp_id, user_id });
  } else {
    console.log('User does not have a valid FCM token');
  }
}

function getNumberOfApprovedUsers(tremp: any): number {
  return tremp.users_in_tremp.reduce((sum: number, user: UserInTremp) => {
    return user.is_approved === 'approved' ? sum + (user.participants_amount || 1) : sum;
  }, 0);
}

async function validateTremp(tremp_id: string, creator_id: string): Promise<any> {
  const tremp = await trempDataAccess.FindByID(tremp_id);
  if (!tremp) {
    throw new BadRequestException('Tremp does not exist');
  }
  if (tremp.creator_id.toString() !== creator_id) {
    throw new UnauthorizedException('Only the creator of the tremp can approve or disapprove participants');
  }
  return tremp;
}

function findUserIndex(users: any[], user_id: string): number {
  return users.findIndex((user: any) => user.user_id.toString() === user_id);
}

export async function approveUserInTremp(tremp_id: string, creator_id: string, user_id: string, approval: string): Promise<any> {
  const tremp = await validateTremp(tremp_id, creator_id);

  if (tremp.is_full) {
    throw new BadRequestException('User cannot be approved, all seats are occupied');
  }

  const userIndex = findUserIndex(tremp.users_in_tremp, user_id);
  if (userIndex === -1) {
    throw new BadRequestException('User is not a participant in this tremp');
  }

  const numberOfApprovedUsers = getNumberOfApprovedUsers(tremp);
  if (tremp.seats_amount - numberOfApprovedUsers < tremp.users_in_tremp[userIndex].participants_amount) {
    throw new BadRequestException('There are not enough seats to approve this request');
  }

  tremp.users_in_tremp[userIndex].is_approved = approval;

  if (approval === 'approved' && (numberOfApprovedUsers >= tremp.seats_amount ||
     tremp.tremp_type === 'hitchhiker')) {
      
    tremp.is_full = true;
  }

  return await trempDataAccess.Update(tremp_id, tremp);
}

export async function getTrempById(id: string) {
  return trempDataAccess.FindByID(id);
}

function mapTrempWithoutUsersInTremp(tremp: Tremp, approvalStatus: string) {
  const { users_in_tremp, ...otherProps } = tremp;
  return { ...otherProps, approvalStatus };
};

export async function getUserTremps(user_id: string, tremp_type: string) {
  const userId = new ObjectId(user_id);
  const first = tremp_type === 'driver' ? 'driver' : 'hitchhiker';
  const second = tremp_type === 'hitchhiker' ? 'driver' : 'hitchhiker';

  const driverQuery = {
    creator_id: userId,
    tremp_type: first,
    deleted: false
  };

  const hitchhikerQuery = {
    $and: [
      { "users_in_tremp.user_id": userId },
      { "users_in_tremp.is_approved": { $ne: 'canceled' } }
    ],
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

// delete or cancel tremp
async function cancelTremp(tremp: any, user_id: string) {
  const userIndex = tremp.users_in_tremp.findIndex((user: any) => user.user_id.toString() === user_id);
  tremp.users_in_tremp[userIndex].is_approved = 'canceled';
  await trempDataAccess.Update(tremp._id, tremp)
  const creatorId = tremp.creator_id;
  const user_in_tremp = await userDataAccess.FindById(creatorId);
  const fcmToken = user_in_tremp.notification_token;
  if (fcmToken) {
    await sendNotificationToUser(fcmToken, `The joiner canceled`,
      `The joiner canceled his request`);
  } else {
    console.log('User does not have a valid FCM token');
  }

  return { message: "Tremp is canceled" };
}

async function notifyUsers(usersToNotify: UserInTremp[], tremp_id: string, user_id: string) {
  const userTokens = await userDataAccess.FindAllUsers(
    { _id: { $in: usersToNotify.map((u: UserInTremp) => new ObjectId(u.user_id)) } },
    { notification_token: 1 }
  );

  for (const userToken of userTokens) {
    if (userToken.notification_token) {
      await sendNotificationToUser(userToken.notification_token, "Tremp cancellation notice",
        "The tremp you joined has been cancelled.", { tremp_id, user_id });
    }
  }
}

export async function deleteTremp(tremp_id: string, user_id: string) {
  const userId = new ObjectId(user_id);
  const tremp = await trempDataAccess.FindByID(tremp_id);

  // Check if the tremp exists
  if (!tremp) {
    throw new BadRequestException('Tremp does not exist');
  }

  // Check if the user requesting the delete is not the creator of the tremp
  if (!tremp.creator_id.equals(userId)) {
    console.log("gdfg");

    return cancelTremp(tremp, user_id);
  }

  // Find users in the tremp who need to be notified
  const usersToNotify = tremp.users_in_tremp.filter((user: UserInTremp) => user.is_approved === 'approved' || 'pending');

  if (usersToNotify.length > 0) {
    await notifyUsers(usersToNotify, tremp_id, user_id);
  }

  const result = await trempDataAccess.Update(tremp_id, { deleted: true });
  if (result.modifiedCount === 0) {
    throw new BadRequestException('Tremp could not be deleted');
  }

  return { message: "Tremp is deleted" };
}

export async function getUsersInTremp(trempId: string): Promise<any[]> {
  const tremp = await trempDataAccess.FindByID(trempId);
  if (!tremp) {
    throw new NotFoundException('Tremp not found');
  }

  const usersDetails = await Promise.all(
    tremp.users_in_tremp.map(async (userInTremp: UserInTremp) => {
      const userIdString = userInTremp.user_id.toString();
      const user = await userDataAccess.FindById(userIdString);
      return {
        user_id: userInTremp.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        image_URL: user.image_URL,
        gender: user.gender,
        is_approved: userInTremp.is_approved,
        participants_amount: userInTremp.participants_amount,
      };
    })
  );

  return usersDetails;
};

export async function getApprovedTremps(user_id: string, tremp_type: string) {
  const userId = new ObjectId(user_id);
  const first = tremp_type === 'driver' ? 'driver' : 'hitchhiker';
  const second = tremp_type === 'hitchhiker' ? 'driver' : 'hitchhiker';

  // First, find the tramps where the user is the creator and has type 'first' and there is
  // at least one different user who is approved and type 'second'
  const createdByUserQuery = {
    creator_id: userId,
    tremp_type: first,
    "users_in_tremp": {
      "$elemMatch": {
        "user_id": { "$ne": userId },
        "is_approved": 'approved',
      }
    }
  };

  const trampsCreatedByUser = await trempDataAccess.FindAll(createdByUserQuery);

  // Then, find the tramps where the user has joined as type 'second' and is approved
  const joinedByUserQuery = {
    tremp_type: second,
    "users_in_tremp": {
      "$elemMatch": {
        "user_id": userId,
        "is_approved": 'approved',
      }
    }
  };

  const trampsJoinedByUser = await trempDataAccess.FindAll(joinedByUserQuery);

  const trampsToShow = await Promise.all(
    [...trampsCreatedByUser, ...trampsJoinedByUser].map(async tramp => {

      // Identifying the driver based on tremp type and Identifying the hitchhikers
      let driverId;
      let hitchhikers;
      if (tramp.tremp_type === 'driver') {
        driverId = tramp.creator_id;

        hitchhikers = await Promise.all(
          tramp.users_in_tremp
            .filter((user: UsersApprovedInTremp) => user.is_approved === 'approved')
            .map((user: UsersApprovedInTremp) => getUserDetailsById(user.user_id))
        );

      } else {
        driverId = tramp.users_in_tremp.find((user: UsersApprovedInTremp) => user.is_approved === 'approved')?.user_id;
        hitchhikers = await getUserDetailsById(tramp.creator_id);
      }
      const driver = await getUserDetailsById(driverId);


      return {
        ...tramp,
        driver: {
          user_id: driver.user_id,
          first_name: driver.first_name,
          last_name: driver.last_name
        },
        hitchhikers,
        users_in_tremp: undefined // Removing users_in_tremp from the response
      };
    })
  );

  return trampsToShow;
}

async function getUserDetailsById(userId: ObjectId) {
  try {
    const user = await userDataAccess.FindById(userId.toString());
    if (!user) {
      throw new Error('User not found');
    }
    return {
      user_id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    };
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
}


export async function getAllTremps() {
  return trempDataAccess.FindAll({ deleted: false });
}
