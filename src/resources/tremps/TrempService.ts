// src/resources/tremps/trempService.ts
import TrempModel from './TrempModel';
import TrempDataAccess from './TrempDataAccess';
import UserDataAccess from '../users/UserDataAccess';
import { ObjectId } from 'mongodb';
import { Tremp, TrempRequest, UserInTremp, UsersApprovedInTremp, ReturnDrive, Route } from './TrempInterfaces';
import { sendNotificationToUser } from '../../services/sendNotification';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../../middleware/HttpException';
import { validateTrempRequest } from './TrempRequestValidation';

const trempDataAccess = new TrempDataAccess();
const userDataAccess = new UserDataAccess();

// createTremp
export async function createTremp(clientData: TrempRequest) {
  validateTrempRequest(clientData);

  const { creator_id, group_id, tremp_type, dates, hour, from_route, to_route, is_permanent, return_drive, seats_amount,note} = clientData;
  const creatorIdObj = new ObjectId(creator_id);
  const groupIdObj = new ObjectId(group_id);
  const fullHour = hour + ':00'
  const today = getTodayDate()

  const createSingleRide = (rideDate: Date, fromRoute: typeof from_route, toRoute: typeof to_route) => {
    return createSingleTremp(rideDate, creatorIdObj, groupIdObj, tremp_type, fromRoute, toRoute, seats_amount,note);
  };

  const createAndHandleRides = async (date: Date) => {
    await createSingleRide(date, from_route, to_route);
    if (return_drive.is_active) {
      await handleReturnDrive(date, fullHour, return_drive, to_route, from_route, createSingleRide);
    }
    date.setDate(date.getDate() + 7);
  }

  for (const dateValue of Object.values(dates)) {
    if (dateValue) {
      let date = buildTrempTime(dateValue, fullHour);

      if (date < today) {
        date.setDate(date.getDate() + 7);
      }

      const existingTremps = await findExistingTremps(creatorIdObj, date);
      if (existingTremps.length > 0) {
        throw new BadRequestException('You already have a tremp scheduled for this date and time.');
      }

      const repetitions = is_permanent ? 4 : 1;
      for (let i = 0; i < repetitions; i++) {
        await createAndHandleRides(date);
      }
    }
  }
}
function getTodayDate() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}
async function findExistingTremps(creatorIdObj: ObjectId, date: Date) {
  const existingTrempsQuery = { creator_id: creatorIdObj, tremp_time: date };
  return await trempDataAccess.FindTrempsByFilters(existingTrempsQuery);
}
function validateTrempHours(hour: string, return_hour: string, date: Date, returnDate: Date) {
  const [hourH, hourM] = hour.split(':').map(Number);
  const [returnHourH, returnHourM] = return_hour.split(':').map(Number);

  let hourInMinutes = hourH * 60 + hourM;
  let returnHourInMinutes = returnHourH * 60 + returnHourM;

  // If return hour is less than departure hour, assume it's the next day
  if (returnHourInMinutes < hourInMinutes) {
    returnHourInMinutes += 24 * 60; // Add 24 hours to the return hour
    returnDate.setDate(returnDate.getDate() + 1); // Increment the return date by one day
  }

  const differenceInMinutes = returnHourInMinutes - hourInMinutes;

  const threeHoursInMinutes = 3 * 60;
  const fourteenHoursInMinutes = 14 * 60;

  if (differenceInMinutes < threeHoursInMinutes || differenceInMinutes > fourteenHoursInMinutes) {
    throw new BadRequestException("Return time must be at least 3 hours and no more than 14 hours from departure time");
  }
}
function buildTrempTime(dateValue: string, hour: string) {
  const date = new Date(dateValue);
  const [hours, minutes, seconds] = hour.split(':').map(Number);
  date.setUTCHours(hours, minutes, seconds);
  return date;
}
async function handleReturnDrive(date: Date, hour: string, return_drive: ReturnDrive, from_route: Route,
  to_route: Route, createSingleRide: Function) {
  const returnDate = new Date(date);
  const [returnHours, returnMinutes, returnSeconds] = return_drive.return_hour.split(':').map(Number);
  returnDate.setUTCHours(returnHours, returnMinutes, returnSeconds);
  validateTrempHours(hour, return_drive.return_hour, date, returnDate);
  await createSingleRide(returnDate, from_route, to_route);
}
async function createSingleTremp(date: Date, creatorIdObj: ObjectId, groupIdObj: ObjectId, tremp_type:
  string, from_route: Route, to_route: Route, seats_amount: number,note: string) {
  const newTremp = new TrempModel({
    creator_id: creatorIdObj,
    group_id: groupIdObj,
    tremp_type,
    tremp_time: date,
    from_route,
    to_route,
    seats_amount,
    note
  });
  await trempDataAccess.insertTremp(newTremp);
}


// getTrempsByFilters
export async function getTrempsByFilters(filters: any): Promise<any> {
  const query = constructQueryFromFilters(filters);
  const tremps = await trempDataAccess.FindTrempsByFilters(query);
  const uniqueUserIds = [...new Set(tremps.map(tremp => new ObjectId(tremp.creator_id)))];

  const users = await userDataAccess.FindAllUsers(
    { _id: { $in: uniqueUserIds } },
    { first_name: 1, last_name: 1, image_URL: 1, gender: 1 }
  );

  const usersMap = createUserMapFromList(users);
  appendCreatorInformationToTremps(tremps, usersMap);

  return tremps;
}
function constructQueryFromFilters(filters: any): object {
  const userId = new ObjectId(filters.creator_id);
  const date = new Date(filters.tremp_time);
  return {
    deleted: false,
    is_full: false,
    creator_id: { $ne: userId },
    tremp_time: { $gt: date },
    tremp_type: filters.tremp_type,
    users_in_tremp: {
      $not: {
        $elemMatch: { user_id: userId },
      },
    },
  };
}
function createUserMapFromList(users: any[]): Map<string, any> {
  return new Map(users.map(user => [user._id.toString(), user]));
}
function appendCreatorInformationToTremps(tremps: any[], usersMap: Map<string, any>): void {
  tremps.forEach(tremp => {
    tremp.participants_amount = getNumberOfApprovedUsers(tremp)
    tremp.users_in_tremp = undefined
    let user = usersMap.get(tremp.creator_id.toString());
    if (user) {
      tremp.creator = {
        first_name: user.first_name,
        last_name: user.last_name,
        image_URL: user.image_URL,
        gender: user.gender,
      };
    }
  });
}


// addUserToTremp
export async function addUserToTremp(tremp_id: string, user_id: string, participants_amount: number = 1) {
  const userId = new ObjectId(user_id);
  const user = { user_id: userId, participants_amount, is_approved: "pending" };

  const tremp = await validateUserAndTremp(tremp_id, userId);
  await updateTrempWithUser(tremp_id, user);
  await notifyCreatorOfNewJoin(tremp.creator_id, tremp_id, user_id);
}
async function validateUserAndTremp(tremp_id: string, userId: ObjectId) {
  const tremp = await trempDataAccess.FindByID(tremp_id);
  if (!tremp) {
    throw new NotFoundException('Tremp not found');
  }
  if (userId.equals(tremp.creator_id)) {
    throw new BadRequestException('The creator cannot join the tremp');
  }
  return tremp;
}
async function updateTrempWithUser(tremp_id: string, user: any) {
  const query = { $push: { users_in_tremp: user } };
  const updatedTremp = await trempDataAccess.addUserToTremp(tremp_id, query);
  if (updatedTremp.matchedCount === 0 || updatedTremp.modifiedCount === 0) {
    throw new BadRequestException('User not added to the tremp');
  }
}
async function notifyCreatorOfNewJoin(creatorId: ObjectId, tremp_id: string, user_id: string) {
  const creator = await userDataAccess.FindById(creatorId.toString());
  const fcmToken = creator.notification_token;
  if (fcmToken) {
    await sendNotificationToUser(fcmToken, 'New User Joined Drive',
      'A user has joined your drive.', { tremp_id, user_id });
  } else {
    console.log('User does not have a valid FCM token');
  }
}


// approveUserInTremp
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


// getUserTremp
export async function getUserTremps(user_id: string, tremp_type: string) {
  const userId = new ObjectId(user_id);
  const primaryType = tremp_type === 'driver' ? 'driver' : 'hitchhiker';
  const secondaryType = tremp_type === 'hitchhiker' ? 'driver' : 'hitchhiker';

  const driverTremps = (await trempDataAccess.FindAll({ creator_id: userId, tremp_type: primaryType, deleted: false })) as unknown as Tremp[];
  const hitchhikerTremps = (await trempDataAccess.FindAll({
    $and: [
      { "users_in_tremp.user_id": userId },
      { "users_in_tremp.is_approved": { $ne: 'canceled' } }
    ],
    tremp_type: secondaryType,
    deleted: false
  })) as unknown as Tremp[];


  const driverTrempsMapped = driverTremps.map(tremp => mapTrempWithApprovalStatus(tremp, userId, primaryType));
  const hitchhikerTrempsMapped = hitchhikerTremps.map(tremp => mapTrempWithApprovalStatus(tremp, userId, secondaryType));

  return [...driverTrempsMapped, ...hitchhikerTrempsMapped];
}
function mapTrempWithApprovalStatus(tremp: Tremp, userId: ObjectId, type: string) {
  const { users_in_tremp, ...otherProps } = tremp;
  const approvalStatus = getApprovalStatus(tremp, userId, type);
  return { ...otherProps, approvalStatus };
}
function getApprovalStatusForCreator(tremp: Tremp): string {
  if (tremp.users_in_tremp.length === 0) return 'no applicants';
  const pending = tremp.users_in_tremp.some((user: UserInTremp) => user.is_approved === 'pending');
  const denied = tremp.users_in_tremp.every((user: UserInTremp) => user.is_approved === 'denied');
  if (pending) return 'awaiting approval from me';
  if (denied) return 'no applicants';
  return 'all approved';
}
function getApprovalStatusForParticipant(userInTremp: UserInTremp, type: string): string {
  switch (userInTremp.is_approved) {
    case 'pending':
      return type === 'driver' ? 'waiting for approval from driver' : 'waiting for approval from hitchhiker';
    case 'denied':
      return 'not approved';
    case 'approved':
      return 'approved';
    default:
      return 'not involved';
  }
}
function getApprovalStatus(tremp: Tremp, userId: ObjectId, type: string): string {
  if (tremp.creator_id.equals(userId)) {
    return getApprovalStatusForCreator(tremp);
  }
  const userInTremp = tremp.users_in_tremp.find((user: UserInTremp) => user.user_id.equals(userId));
  if (userInTremp) {
    return getApprovalStatusForParticipant(userInTremp, type);
  }
  return 'not involved';
}


// deleteTremp --> delete or cancel tremp
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


// getUsersInTremp
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
        participants_amount: userInTremp.participants_amount
      };
    })
  );

  return usersDetails;
};


// getApprovedTremps
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



// ##############################################
export async function getAllTremps() {
  return trempDataAccess.FindAll({ deleted: false });
}
export async function getTrempById(id: string) {
  return trempDataAccess.FindByID(id);
}