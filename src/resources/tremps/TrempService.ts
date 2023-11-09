// src/resources/tremps/trempService.ts
import TrempModel from './TrempModel';
import TrempDataAccess from './TrempDataAccess';
import UserDataAccess from '../users/UserDataAccess';
import { ObjectId } from 'mongodb';
import { Tremp, TrempRequest, UserInTremp, UsersApprovedInTremp, } from './TrempInterfaces';
import { sendNotificationToUser } from '../../services/sendNotification';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../../middleware/HttpException';
import { validateTrempRequest } from './TrempRequestValidation';
import { getCurrentTimeInIsrael } from '../../services/TimeService';
import { HOUR_DIFFERENCE } from "../../config/environment";

import db from '../../utils/db';

const trempDataAccess = new TrempDataAccess();
const userDataAccess = new UserDataAccess();

/**
 * Creates a new tremp (ride).
 * 1. Validates the provided data for the tremp.
 * 2. Extracts specific details from the client's data and formats them.
 * 3. Prepares the dates for when the tremp should occur by ensuring they're in the future.
 * 4. Checks if there are already existing 'tremps' for the given dates.
 * 5. Prepares the data for the tremp and its return drive if available.
 * 6. Inserts all prepared 'tremps' into the database.
 * 
 * If there are any overlaps with existing tremps on the provided dates, an error is thrown.
 * Helper functions are used for specific tasks like validation and data preparation.
 *
 * Helper functions:
 * - `reformatHour(hour)`: Appends ":00" to the hour string.
 * - `getTodayDate()`: Gets today's date at midnight UTC.
 * - `findExistingTremps(creatorId, dates)`: Finds tremps by creator and dates.
 * - `validateTrempHours(hour, return_hour, date, returnDate)`: Checks return time's difference from departure.
 * - `buildTrempTime(dateValue, hour)`: Combines date and hour into a Date object.
 * - `createSingleTrempDoc(date, creatorIdObj, groupIdObj, rest)`: Constructs a new tremp model.
 */
export async function createTremp(clientData: TrempRequest) {
  validateTrempRequest(clientData);

  const { creator_id, group_id, ...rest } = clientData;
  const creatorIdObj = new ObjectId(creator_id);
  const groupIdObj = new ObjectId(group_id);
  const today = getTodayDate();

  const allDates = Object.values(clientData.dates)
    .filter(dateValue => dateValue)
    .map(dateValue => {
      const date = buildTrempTime(dateValue, reformatHour(clientData.hour));
      if (date < today) date.setDate(date.getDate() + 7);
      return date;
    });

  const existingTremps = await findExistingTremps(creator_id, allDates);


  if (existingTremps.length > 0) {
    throw new BadRequestException('You already have a tremp scheduled for one of these dates and times.');
  }

  const ridesToInsert = [];

  for (const originalDate of allDates) {
    const repetitions = clientData.is_permanent ? 4 : 1;

    for (let i = 0; i < repetitions; i++) {
      let date = new Date(originalDate);
      date.setDate(date.getDate() + (7 * i));

      ridesToInsert.push(createSingleTrempDoc(date, creatorIdObj, groupIdObj, rest));
      const returnHour = rest.return_hour;
      if (returnHour) {
        const returnDate = new Date(date);
        const [returnHourH, returnHourM] = reformatHour(returnHour).split(':').map(Number);
        returnDate.setUTCHours(returnHourH, returnHourM, 0, 0);

        validateTrempHours(rest.hour, reformatHour(returnHour), date, returnDate);

        ridesToInsert.push(createSingleTrempDoc(returnDate, creatorIdObj, groupIdObj, {
          ...rest,
          from_route: rest.to_route,
          to_route: rest.from_route
        }));
      }

    }
  }

  await trempDataAccess.insertTremps(ridesToInsert);
}
function reformatHour(hour: string): string {
  return hour + ':00';
}
function getTodayDate() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}
async function findExistingTremps(creatorId: string, dates: Date[]) {
  const existingTrempsQuery = { creator_id: new ObjectId(creatorId), tremp_time: { $in: dates }, deleted: false };
  return await trempDataAccess.FindTrempsByFilters(existingTrempsQuery);
}
function validateTrempHours(hour: string, return_hour: string, date: Date, returnDate: Date) {
  const [hourH, hourM] = hour.split(':').map(Number);
  const [returnHourH, returnHourM] = return_hour.split(':').map(Number);
  const minInHour = 60;
  let hourInMinutes = hourH * minInHour + hourM;
  let returnHourInMinutes = returnHourH * minInHour + returnHourM;

  // If return hour is less than departure hour, assume it's the next day
  if (returnHourInMinutes < hourInMinutes) {
    returnHourInMinutes += 24 * minInHour; // Add 24 hours to the return hour
    returnDate.setDate(returnDate.getDate() + 1); // Increment the return date by one day
  }

  const differenceInMinutes = returnHourInMinutes - hourInMinutes;
  console.log(HOUR_DIFFERENCE);
  const hourDifferenceInMinutes = Number(HOUR_DIFFERENCE) * minInHour;
  const fourteenHoursInMinutes = 14 * minInHour;

  if (differenceInMinutes < hourDifferenceInMinutes || differenceInMinutes > fourteenHoursInMinutes) {
    throw new BadRequestException("Return time must be at least 3 hours and no more than 14 hours from departure time");
  }
}
function buildTrempTime(dateValue: string, hour: string) {
  const date = new Date(dateValue);
  const [hours, minutes, seconds] = hour.split(':').map(Number);
  date.setUTCHours(hours, minutes, seconds);
  return date;
}
function createSingleTrempDoc(date: Date, creatorIdObj: ObjectId, groupIdObj: ObjectId, rest: Partial<TrempModel>): TrempModel {
  const trempData = {
    creator_id: creatorIdObj,
    group_id: groupIdObj,
    tremp_time: date,
    ...rest
  };

  const newTremp = new TrempModel(trempData);
  newTremp.validateTremp();
  return newTremp;
}



// getTrempsToSearch
export async function getTrempsByFilters(filters: any): Promise<any> {
  const query = await constructQueryFromFilters(filters);

  const pipeline = [
    { $match: query },
    {
      $lookup: {
        from: 'Users',
        localField: 'creator_id',
        foreignField: '_id',
        as: 'creatorInfo'
      }
    },
    {
      $unwind: '$creatorInfo'
    },
    {
      $addFields: {
        participants_amount: { $size: "$users_in_tremp" },
        creator: {
          first_name: "$creatorInfo.first_name",
          last_name: "$creatorInfo.last_name",
          image_URL: "$creatorInfo.image_URL",
          gender: "$creatorInfo.gender"
        }
      }
    },
    {
      $unset: ['users_in_tremp', 'creatorInfo']
    },
    {
      $sort: { tremp_time: 1 }
    }
  ];

  return await db.aggregate('Tremps', pipeline);
}
async function constructQueryFromFilters(filters: any): Promise<any> {
  const user = await userDataAccess.FindById(filters.user_id);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  const userId = user._id;
  const connectedGroups = user.groups;
  const date = getCurrentTimeInIsrael();
  const hours = date.getUTCHours();
  date.setUTCHours(hours - 6);

  return {
    deleted: false,
    is_full: false,
    is_completed: false,
    group_id: { $in: connectedGroups },
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

/**
 * Allows a user to join a specific 'tremp' (ride).
 * 
 * 1. The function transforms the user's ID into ObjectId a format suitable for the database.
 * 2. Then, it creates a user_in_tremp object with the user id and the status set to "pending".
 * 3. Next, it checks if the user can join the specified 'tremp'.
 * 4. It adds the user to the 'tremp'.
 * 5. Finally, it notifies the creator of the 'tremp' that a new user has joined.
 * 
 * Helper Functions:
 * - `validateUserInTremp(tremp_id, userId)`: Validates the 'tremp' and checks the user isn't its creator.
 * - `updateTrempWithUser(tremp_id, user)`: Adds the user to the 'tremp'; If unsuccessful, it throws an error.
 * - `notifyCreatorOfNewParticipant(creatorId, tremp_id, user_id)`: Sends a notification to the 'tremp' creator about the new participant.
 */
export async function joinToTremp(tremp_id: string, user_id: string, participants_amount: number = 1) {
  const userId = new ObjectId(user_id);
  const user = { user_id: userId, participants_amount, is_approved: "pending" };

  const tremp = await validateUserInTremp(tremp_id, userId);
  await updateTrempWithUser(tremp_id, user);
  await notifyCreatorOfNewParticipant(tremp.creator_id, tremp_id, user_id);
}

async function validateUserInTremp(tremp_id: string, userId: ObjectId) {
  const tremp = await trempDataAccess.FindByID(tremp_id);

  if (!tremp) {
    throw new NotFoundException('Tremp not found');
  }

  // Check if the user is the creator of the tremp.
  if (userId.equals(tremp.creator_id)) {
    throw new BadRequestException('The creator cannot join the tremp');
  }

  // Check if the user is already a participant in the tremp.
  const userInTremp = tremp.users_in_tremp.find((participant: any) => participant.user_id.equals(userId));
  if (userInTremp) {
    throw new BadRequestException('User is already a participant in this tremp');
  }

  return tremp;
}

async function updateTrempWithUser(tremp_id: string, user: UserInTremp) {
  const query = { $push: { users_in_tremp: user } };
  const updatedTremp = await trempDataAccess.UpdateTremp(tremp_id, query);
  if (updatedTremp.matchedCount === 0 || updatedTremp.modifiedCount === 0) {
    throw new BadRequestException('User not added to the tremp');
  }
}

async function notifyCreatorOfNewParticipant(creatorId: ObjectId, tremp_id: string, user_id: string) {

  // Fetch creator and Participant based on their IDs
  const users = await userDataAccess.FindAllUsers({ _id: { $in: [creatorId, new ObjectId(user_id)] } });

  // Logic to ensure the creator is the first user and the joiner is the second
  let creator, joiner;
  if (users[0]._id.toString() === creatorId.toString()) {
    creator = users[0];
    joiner = users[1];
  } else {
    creator = users[1];
    joiner = users[0];
  }
  const fcmToken = creator.notification_token;

  if (fcmToken) {
    await sendNotificationToUser(
      fcmToken,
      'Participant Alert: New Joiner for Your Ride',
      `${joiner.first_name} ${joiner.last_name} has joined your scheduled ride!`,
      { tremp_id, user_id }
    );
  } else {
    console.log(`Creator (ID: ${creatorId}) does not have a valid FCM token for notifications.`);
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

// getUserTremps
export async function getUserTremps(user_id: string, tremp_type: string) {
  const userId = new ObjectId(user_id);
  const primaryType = tremp_type === 'driver' ? 'driver' : 'hitchhiker';
  const secondaryType = tremp_type === 'hitchhiker' ? 'driver' : 'hitchhiker';

  const currentDate = getCurrentTimeInIsrael()
  currentDate.setUTCHours(0, 0, 0, 0);

  const driverTremps = (await trempDataAccess.FindAll({
    creator_id: userId,
    tremp_type: primaryType,
    deleted: false,
    is_completed: false,
    tremp_time: { $gte: currentDate }
  })) as unknown as Tremp[];

  const hitchhikerTremps = (await trempDataAccess.FindAll({
    $and: [
      { "users_in_tremp.user_id": userId },
      { "users_in_tremp.is_approved": { $ne: 'canceled' } },
      { tremp_time: { $gte: currentDate } }
    ],
    tremp_type: secondaryType,
    deleted: false
  })) as unknown as Tremp[];


  const driverTrempsMapped = driverTremps.map(tremp => mapTrempWithApprovalStatus(tremp, userId, primaryType));
  const hitchhikerTrempsMapped = hitchhikerTremps.map(tremp => mapTrempWithApprovalStatus(tremp, userId, secondaryType));

  return {
    created: driverTrempsMapped,
    connected: hitchhikerTrempsMapped,
  };
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

  if (userIndex === -1) {
    throw new BadRequestException('User is not a participant in this tremp');
  }

  tremp.users_in_tremp[userIndex].is_approved = 'canceled';

  // Update is_full to false if the tremp is no longer full
  if (tremp.is_full) {
    tremp.is_full = false;
  }

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
        participants_amount: userInTremp.participants_amount,
        notification_token: user.notification_token
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

  const currentDate = getCurrentTimeInIsrael();
  const hours = currentDate.getUTCHours();
  currentDate.setUTCHours(hours - 6);

  // First, find the tramps where the user is the creator and has type 'first' and there is
  // at least one different user who is approved and type 'second'
  const createdByUserQuery = {
    deleted: false,
    creator_id: userId,
    is_completed: false,
    tremp_type: first,
    tremp_time: { "$gte": currentDate },
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
    deleted: false,
    tremp_type: second,
    is_completed: false,
    tremp_time: { "$gte": currentDate },
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
        const hitchhiker = await getUserDetailsById(tramp.creator_id);
        hitchhikers = [hitchhiker];
      }
      const driver = await getUserDetailsById(driverId);

      return {
        ...tramp,
        driver: {
          user_id: driver.user_id,
          first_name: driver.first_name,
          last_name: driver.last_name,
          notification_token: driver.notification_token,
          image_URL: driver.image_URL,
        },
        hitchhikers,
        users_in_tremp: undefined
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
      last_name: user.last_name,
      notification_token: user.notification_token,
      image_URL: user.image_URL,
    };
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
}

// trempCompleted
export async function trempCompleted(trempId: string, userId: string): Promise<any> {
  const tremp = await trempDataAccess.FindByID(trempId);

  if (!tremp) {
    throw new BadRequestException('Tremp does not exist');
  }

  if (tremp.tremp_type === 'driver' && (!tremp.creator_id.equals(userId))
    || tremp.tremp_type === 'hitchhiker' && tremp.creator_id.equals(userId)) {
    throw new UnauthorizedException('Only the Driver can update tremp to be completed');
  }

  tremp.is_completed = true;

  return await trempDataAccess.Update(trempId, tremp);
}
export async function getTrempsHistory(user_id: string, tremp_type: string) {
  const userId = new ObjectId(user_id);
  const first = tremp_type === 'driver' ? 'driver' : 'hitchhiker';
  const second = tremp_type === 'hitchhiker' ? 'driver' : 'hitchhiker';

  const currentDate = getCurrentTimeInIsrael();
  const hours = currentDate.getUTCHours();
  currentDate.setUTCHours(hours - 6);

  const createdByUserQuery = {
    creator_id: userId,
    tremp_type: first,
    "users_in_tremp": {
      "$elemMatch": {
        "user_id": { "$ne": userId },
        "is_approved": 'approved',
      }
    },
    "$or": [
      { tremp_time: { "$lt": currentDate } },
      { is_completed: true }
    ]
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
    }, "$or": [
      { tremp_time: { "$lt": currentDate } },
      { is_completed: true }
    ]
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
        const hitchhiker = await getUserDetailsById(tramp.creator_id);
        hitchhikers = [hitchhiker];
      }

      const driver = await getUserDetailsById(driverId);

      return {
        ...tramp,
        driver: {
          user_id: driver.user_id,
          first_name: driver.first_name,
          last_name: driver.last_name,
          notification_token: driver.notification_token,
          image_URL: driver.image_URL,
        },
        hitchhikers,
        users_in_tremp: undefined // Removing users_in_tremp from the response
      };
    })
  );

  return trampsToShow;
}

// admin
export async function getAllTremps() {
  return trempDataAccess.getAllTremps();
}

export async function getTrempById(id: string) {
  return trempDataAccess.FindByID(id);
}

export async function getTremp() {
  let lastCheckedTime = getCurrentTimeInIsrael();
  const currentTime = getCurrentTimeInIsrael();
  console.log(currentTime);
  console.log(lastCheckedTime);
  const upcomingTremps = await db.FindAll('Tremps', {
    deleted: false,
    tremp_time: {
      $gte: lastCheckedTime,
    },
    "users_in_tremp": {
      "$elemMatch": {
        "is_approved": 'approved',
      }
    }
  });
  return upcomingTremps;
}

export async function notifyForUpcomingTremps() {
  const lastCheckedTime = getCurrentTimeInIsrael();
  const currentTime = new Date(lastCheckedTime.getTime() + 90 * 60 * 1000);
  const upcomingTremps = await trempDataAccess.findUpcomingTremps(lastCheckedTime, currentTime);

  for (const tremp of upcomingTremps) {
    const driver = await db.FindByID('Users', tremp.creator_id.toString());

    if (driver && driver.first_name && driver.notification_token) {
      const trempTimeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
      tremp.tremp_time.setHours(tremp.tremp_time.getHours() - 2);
      const trempTime = trempTimeFormatter.format(tremp.tremp_time);
      const title = `Upcoming Tremp!`;
      const body = `Hi ${driver.first_name}, you have a tremp scheduled for ${trempTime}.`;
      const data = { trempId: tremp._id.toString() };

      // Send push notification
      await sendNotificationToUser(driver.notification_token, title, body, data);
    }
  }
}





