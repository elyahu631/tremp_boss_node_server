// src/resources/tremps/trempService.ts
import TrempModel from './TrempModel';
import TrempDataAccess from './TrempDataAccess';
import UserDataAccess from '../users/UserDataAccess';
import { ObjectId } from 'mongodb';
import { Tremp, UserInTremp } from './TrempInterfaces';
import { sendNotificationToUser } from '../../services/sendNotification';

const trempDataAccess = new TrempDataAccess();
const userDataAccess = new UserDataAccess();

export async function createTremp(tremp: TrempModel) {
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
    tremp_type: filters.type_of_tremp,
    users_in_tremp: {
      $not: {
        $elemMatch: { user_id: userId }
      }
    },
  };

  let tremps = await trempDataAccess.FindTrempsByFilters(query);

  // Get all unique user IDs
  let uniqueUserIds = [...new Set(tremps.map(tremp => new ObjectId(tremp.creator_id)))];///
  console.log(uniqueUserIds);

  // Fetch all users in one operation
  let users = await userDataAccess.FindAllUsers(
    { _id: { $in: uniqueUserIds } },
    { first_name: 1, last_name: 1, photo_URL: 1 }
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
        photo_URL: user.photo_URL
      };
    }
  });

  return tremps;
}

export async function addUserToTremp(tremp_id: string, user_id: string) {
  let id = new ObjectId(user_id);
  const user = { user_id: id, is_approved: "pending" };
  const query = ({ $push: { users_in_tremp: user } });
  return await trempDataAccess.addUserToTremp(tremp_id, query);
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

export async function getUserTremps(user_id: string, type_of_tremp: string) {
  const userId = new ObjectId(user_id);
  const first = type_of_tremp === 'driver' ? 'driver': 'hitchhiker' ;
  const second = type_of_tremp === 'hitchhiker' ? 'driver': 'hitchhiker' ;

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
    return { ...tremp, approvalStatus };
  });
  const hitchhikerTremps: Tremp[] = await trempDataAccess.FindAll(hitchhikerQuery) as any;

  const hitchhikerTrempsMapped = hitchhikerTremps.map(tremp => {  
    const approvalStatus = getApprovalStatus(tremp, userId, second);
    return { ...tremp, approvalStatus };
  });

  const tremps = [...driverTrempsMapped, ...hitchhikerTrempsMapped];

  return tremps;
}

function getApprovalStatus(tremp: Tremp, userId: ObjectId, type_of_tremp: string): string {
  if (type_of_tremp === 'driver') {
    console.log('User is the creator');
    if (tremp.creator_id.equals(userId)) {
      if (tremp.users_in_tremp.length === 0) {
        return 'no applicants';
      } else {
        const pending = tremp.users_in_tremp.some((user: UserInTremp) => user.is_approved === 'pending');
        const denied = tremp.users_in_tremp.every((user: UserInTremp) => user.is_approved === 'denied');
        if (pending) return 'awaiting approval from me';
        if (denied) return 'no applicants';
        return 'all approved';
      }
    } else {
      const userInTremp = tremp.users_in_tremp.find((user: UserInTremp) => user.user_id.equals(userId));
      if (userInTremp) {
        console.log('User is in users_in_tremp');
        switch (userInTremp.is_approved) {
          case 'pending':
            return 'waiting for approval from driver';
          case 'denied':
            return 'not approved';
          case 'approved':
            return 'approved';
          default:
            return 'not involved';
        }
      }
    }
  } else if (type_of_tremp === 'hitchhiker') {
    if (tremp.creator_id.equals(userId)) {
      if (tremp.users_in_tremp.length === 0) {
        return 'no bidders';
      } else {
        const pending = tremp.users_in_tremp.some((user: UserInTremp) => user.is_approved === 'pending');
        const denied = tremp.users_in_tremp.every((user: UserInTremp) => user.is_approved === 'denied');
        if (pending) return 'awaiting approval from me';
        if (denied) return 'no bidders';
        return 'all approved';
      }
    } else {
      console.log('User is neither the creator nor in users_in_tremp');
      const userInTremp = tremp.users_in_tremp.find((user: UserInTremp) => user.user_id.equals(userId));
      if (userInTremp) {
        switch (userInTremp.is_approved) {
          case 'pending':
            return 'waiting for approval from hitchhiker';
          case 'denied':
            return 'not approved';
          case 'approved':
            return 'approved';
          default:
            return 'not involved';
        }
      }
    }
  }

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
