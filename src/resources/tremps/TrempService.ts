// src/resources/tremps/trempService.ts
import TrempModel from './TrempModel';
import TrempDataAccess from './TrempDataAccess';
import UserDataAccess from '../users/UserDataAccess';
import { ObjectId } from 'mongodb';

const trempDataAccess = new TrempDataAccess();
const userDataAccess = new UserDataAccess();

export async function createTremp(tremp: TrempModel) {
  return await trempDataAccess.insertTremp(tremp);
}

export async function getTrempsByFilters(filters: any) {
  const userId = new ObjectId(filters.creator_id);
  const query = {
    deleted: false,
    is_full: false,
    creator_id: { $ne: userId },
    tremp_time: { $gt: filters.tremp_time },
    tremp_type: filters.type_of_tremp,
    users_in_tremp: {
      $not: {
        $elemMatch: { user_id: userId }
      }
    },
  };

  let tremps = await trempDataAccess.FindTrempsByFilters(query);

  

  // Get all unique user IDs
  let uniqueUserIds = [...new Set(tremps.map(tremp => new ObjectId(tremp.creator_id)))];
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
  tremp.users_in_tremp[userIndex].is_approved = approval ? 'approved' : 'denied';

  // Update the tremp in the database
  const result = await trempDataAccess.Update(tremp_id, tremp);

  return result;
}

