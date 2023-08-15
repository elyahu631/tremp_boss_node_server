"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrempById = exports.getAllTremps = exports.getApprovedTremps = exports.getUsersInTremp = exports.deleteTremp = exports.getUserTremps = exports.approveUserInTremp = exports.addUserToTremp = exports.getTrempsByFilters = exports.createTremp = void 0;
// src/resources/tremps/trempService.ts
const TrempModel_1 = __importDefault(require("./TrempModel"));
const TrempDataAccess_1 = __importDefault(require("./TrempDataAccess"));
const UserDataAccess_1 = __importDefault(require("../users/UserDataAccess"));
const mongodb_1 = require("mongodb");
const sendNotification_1 = require("../../services/sendNotification");
const HttpException_1 = require("../../middleware/HttpException");
const TrempRequestValidation_1 = require("./TrempRequestValidation");
const trempDataAccess = new TrempDataAccess_1.default();
const userDataAccess = new UserDataAccess_1.default();
// createTremp
function createTremp(clientData) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, TrempRequestValidation_1.validateTrempRequest)(clientData);
        const { creator_id, group_id, tremp_type, dates, hour, from_route, to_route, is_permanent, return_drive, seats_amount } = clientData;
        const creatorIdObj = new mongodb_1.ObjectId(creator_id);
        const groupIdObj = new mongodb_1.ObjectId(group_id);
        const createSingleRide = (rideDate, fromRoute, toRoute) => {
            return createRide(rideDate, creatorIdObj, groupIdObj, tremp_type, fromRoute, toRoute, seats_amount);
        };
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        for (const dateValue of Object.values(dates)) {
            if (dateValue) {
                let date = buildDate(dateValue, hour);
                console.log(today);
                if (date < today) {
                    date.setDate(date.getDate() + 7); // Increment the date by one week
                }
                for (let i = 0; i < (is_permanent ? 4 : 1); i++) {
                    yield createSingleRide(date, from_route, to_route);
                    if (return_drive.is_active) {
                        yield handleReturnDrive(date, hour, return_drive, to_route, from_route, createSingleRide);
                    }
                    date.setDate(date.getDate() + 7);
                }
            }
        }
    });
}
exports.createTremp = createTremp;
function validateRideHours(hour, return_hour, date, returnDate) {
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
        throw new HttpException_1.BadRequestException("Return time must be at least 3 hours and no more than 14 hours from departure time");
    }
}
function buildDate(dateValue, hour) {
    const date = new Date(dateValue);
    const [hours, minutes, seconds] = hour.split(':').map(Number);
    date.setUTCHours(hours, minutes, seconds);
    return date;
}
function handleReturnDrive(date, hour, return_drive, from_route, to_route, createSingleRide) {
    return __awaiter(this, void 0, void 0, function* () {
        const returnDate = new Date(date);
        const [returnHours, returnMinutes, returnSeconds] = return_drive.return_hour.split(':').map(Number);
        returnDate.setUTCHours(returnHours, returnMinutes, returnSeconds);
        validateRideHours(hour, return_drive.return_hour, date, returnDate);
        yield createSingleRide(returnDate, from_route, to_route);
    });
}
function createRide(date, creatorIdObj, groupIdObj, tremp_type, from_route, to_route, seats_amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const newTremp = new TrempModel_1.default({
            creator_id: creatorIdObj,
            group_id: groupIdObj,
            tremp_type,
            tremp_time: date,
            from_route,
            to_route,
            seats_amount
        });
        yield trempDataAccess.insertTremp(newTremp);
    });
}
// getTrempsByFilters
function getTrempsByFilters(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = constructQueryFromFilters(filters);
        const tremps = yield trempDataAccess.FindTrempsByFilters(query);
        const uniqueUserIds = [...new Set(tremps.map(tremp => new mongodb_1.ObjectId(tremp.creator_id)))];
        const users = yield userDataAccess.FindAllUsers({ _id: { $in: uniqueUserIds } }, { first_name: 1, last_name: 1, image_URL: 1, gender: 1 });
        const usersMap = createUserMapFromList(users);
        appendCreatorInformationToTremps(tremps, usersMap);
        return tremps;
    });
}
exports.getTrempsByFilters = getTrempsByFilters;
function constructQueryFromFilters(filters) {
    const userId = new mongodb_1.ObjectId(filters.creator_id);
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
function createUserMapFromList(users) {
    return new Map(users.map(user => [user._id.toString(), user]));
}
function appendCreatorInformationToTremps(tremps, usersMap) {
    tremps.forEach(tremp => {
        tremp.participants_amount = getNumberOfApprovedUsers(tremp);
        tremp.users_in_tremp = undefined;
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
function addUserToTremp(tremp_id, user_id, participants_amount = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = new mongodb_1.ObjectId(user_id);
        const user = { user_id: userId, participants_amount, is_approved: "pending" };
        const tremp = yield validateUserAndTremp(tremp_id, userId);
        yield updateTrempWithUser(tremp_id, user);
        yield notifyCreatorOfNewJoin(tremp.creator_id, tremp_id, user_id);
    });
}
exports.addUserToTremp = addUserToTremp;
function validateUserAndTremp(tremp_id, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tremp = yield trempDataAccess.FindByID(tremp_id);
        if (!tremp) {
            throw new HttpException_1.NotFoundException('Tremp not found');
        }
        if (userId.equals(tremp.creator_id)) {
            throw new HttpException_1.BadRequestException('The creator cannot join the tremp');
        }
        return tremp;
    });
}
function updateTrempWithUser(tremp_id, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { $push: { users_in_tremp: user } };
        const updatedTremp = yield trempDataAccess.addUserToTremp(tremp_id, query);
        if (updatedTremp.matchedCount === 0 || updatedTremp.modifiedCount === 0) {
            throw new HttpException_1.BadRequestException('User not added to the tremp');
        }
    });
}
function notifyCreatorOfNewJoin(creatorId, tremp_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const creator = yield userDataAccess.FindById(creatorId.toString());
        const fcmToken = creator.notification_token;
        if (fcmToken) {
            yield (0, sendNotification_1.sendNotificationToUser)(fcmToken, 'New User Joined Drive', 'A user has joined your drive.', { tremp_id, user_id });
        }
        else {
            console.log('User does not have a valid FCM token');
        }
    });
}
// approveUserInTremp
function approveUserInTremp(tremp_id, creator_id, user_id, approval) {
    return __awaiter(this, void 0, void 0, function* () {
        const tremp = yield validateTremp(tremp_id, creator_id);
        if (tremp.is_full) {
            throw new HttpException_1.BadRequestException('User cannot be approved, all seats are occupied');
        }
        const userIndex = findUserIndex(tremp.users_in_tremp, user_id);
        if (userIndex === -1) {
            throw new HttpException_1.BadRequestException('User is not a participant in this tremp');
        }
        const numberOfApprovedUsers = getNumberOfApprovedUsers(tremp);
        if (tremp.seats_amount - numberOfApprovedUsers < tremp.users_in_tremp[userIndex].participants_amount) {
            throw new HttpException_1.BadRequestException('There are not enough seats to approve this request');
        }
        tremp.users_in_tremp[userIndex].is_approved = approval;
        if (approval === 'approved' && (numberOfApprovedUsers >= tremp.seats_amount ||
            tremp.tremp_type === 'hitchhiker')) {
            tremp.is_full = true;
        }
        return yield trempDataAccess.Update(tremp_id, tremp);
    });
}
exports.approveUserInTremp = approveUserInTremp;
function getNumberOfApprovedUsers(tremp) {
    return tremp.users_in_tremp.reduce((sum, user) => {
        return user.is_approved === 'approved' ? sum + (user.participants_amount || 1) : sum;
    }, 0);
}
function validateTremp(tremp_id, creator_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const tremp = yield trempDataAccess.FindByID(tremp_id);
        if (!tremp) {
            throw new HttpException_1.BadRequestException('Tremp does not exist');
        }
        if (tremp.creator_id.toString() !== creator_id) {
            throw new HttpException_1.UnauthorizedException('Only the creator of the tremp can approve or disapprove participants');
        }
        return tremp;
    });
}
function findUserIndex(users, user_id) {
    return users.findIndex((user) => user.user_id.toString() === user_id);
}
// getUserTremp
function getUserTremps(user_id, tremp_type) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = new mongodb_1.ObjectId(user_id);
        const primaryType = tremp_type === 'driver' ? 'driver' : 'hitchhiker';
        const secondaryType = tremp_type === 'hitchhiker' ? 'driver' : 'hitchhiker';
        const driverTremps = (yield trempDataAccess.FindAll({ creator_id: userId, tremp_type: primaryType, deleted: false }));
        const hitchhikerTremps = (yield trempDataAccess.FindAll({
            $and: [
                { "users_in_tremp.user_id": userId },
                { "users_in_tremp.is_approved": { $ne: 'canceled' } }
            ],
            tremp_type: secondaryType,
            deleted: false
        }));
        const driverTrempsMapped = driverTremps.map(tremp => mapTrempWithApprovalStatus(tremp, userId, primaryType));
        const hitchhikerTrempsMapped = hitchhikerTremps.map(tremp => mapTrempWithApprovalStatus(tremp, userId, secondaryType));
        return [...driverTrempsMapped, ...hitchhikerTrempsMapped];
    });
}
exports.getUserTremps = getUserTremps;
function mapTrempWithApprovalStatus(tremp, userId, type) {
    const { users_in_tremp } = tremp, otherProps = __rest(tremp, ["users_in_tremp"]);
    const approvalStatus = getApprovalStatus(tremp, userId, type);
    return Object.assign(Object.assign({}, otherProps), { approvalStatus });
}
function getApprovalStatusForCreator(tremp) {
    if (tremp.users_in_tremp.length === 0)
        return 'no applicants';
    const pending = tremp.users_in_tremp.some((user) => user.is_approved === 'pending');
    const denied = tremp.users_in_tremp.every((user) => user.is_approved === 'denied');
    if (pending)
        return 'awaiting approval from me';
    if (denied)
        return 'no applicants';
    return 'all approved';
}
function getApprovalStatusForParticipant(userInTremp, type) {
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
function getApprovalStatus(tremp, userId, type) {
    if (tremp.creator_id.equals(userId)) {
        return getApprovalStatusForCreator(tremp);
    }
    const userInTremp = tremp.users_in_tremp.find((user) => user.user_id.equals(userId));
    if (userInTremp) {
        return getApprovalStatusForParticipant(userInTremp, type);
    }
    return 'not involved';
}
// deleteTremp --> delete or cancel tremp
function deleteTremp(tremp_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = new mongodb_1.ObjectId(user_id);
        const tremp = yield trempDataAccess.FindByID(tremp_id);
        // Check if the tremp exists
        if (!tremp) {
            throw new HttpException_1.BadRequestException('Tremp does not exist');
        }
        // Check if the user requesting the delete is not the creator of the tremp
        if (!tremp.creator_id.equals(userId)) {
            console.log("gdfg");
            return cancelTremp(tremp, user_id);
        }
        // Find users in the tremp who need to be notified
        const usersToNotify = tremp.users_in_tremp.filter((user) => user.is_approved === 'approved' || 'pending');
        if (usersToNotify.length > 0) {
            yield notifyUsers(usersToNotify, tremp_id, user_id);
        }
        const result = yield trempDataAccess.Update(tremp_id, { deleted: true });
        if (result.modifiedCount === 0) {
            throw new HttpException_1.BadRequestException('Tremp could not be deleted');
        }
        return { message: "Tremp is deleted" };
    });
}
exports.deleteTremp = deleteTremp;
function cancelTremp(tremp, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const userIndex = tremp.users_in_tremp.findIndex((user) => user.user_id.toString() === user_id);
        tremp.users_in_tremp[userIndex].is_approved = 'canceled';
        yield trempDataAccess.Update(tremp._id, tremp);
        const creatorId = tremp.creator_id;
        const user_in_tremp = yield userDataAccess.FindById(creatorId);
        const fcmToken = user_in_tremp.notification_token;
        if (fcmToken) {
            yield (0, sendNotification_1.sendNotificationToUser)(fcmToken, `The joiner canceled`, `The joiner canceled his request`);
        }
        else {
            console.log('User does not have a valid FCM token');
        }
        return { message: "Tremp is canceled" };
    });
}
function notifyUsers(usersToNotify, tremp_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const userTokens = yield userDataAccess.FindAllUsers({ _id: { $in: usersToNotify.map((u) => new mongodb_1.ObjectId(u.user_id)) } }, { notification_token: 1 });
        for (const userToken of userTokens) {
            if (userToken.notification_token) {
                yield (0, sendNotification_1.sendNotificationToUser)(userToken.notification_token, "Tremp cancellation notice", "The tremp you joined has been cancelled.", { tremp_id, user_id });
            }
        }
    });
}
// getUsersInTremp
function getUsersInTremp(trempId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tremp = yield trempDataAccess.FindByID(trempId);
        if (!tremp) {
            throw new HttpException_1.NotFoundException('Tremp not found');
        }
        const usersDetails = yield Promise.all(tremp.users_in_tremp.map((userInTremp) => __awaiter(this, void 0, void 0, function* () {
            const userIdString = userInTremp.user_id.toString();
            const user = yield userDataAccess.FindById(userIdString);
            return {
                user_id: userInTremp.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                image_URL: user.image_URL,
                gender: user.gender,
                is_approved: userInTremp.is_approved,
                participants_amount: userInTremp.participants_amount
            };
        })));
        return usersDetails;
    });
}
exports.getUsersInTremp = getUsersInTremp;
;
// getApprovedTremps
function getApprovedTremps(user_id, tremp_type) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = new mongodb_1.ObjectId(user_id);
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
        const trampsCreatedByUser = yield trempDataAccess.FindAll(createdByUserQuery);
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
        const trampsJoinedByUser = yield trempDataAccess.FindAll(joinedByUserQuery);
        const trampsToShow = yield Promise.all([...trampsCreatedByUser, ...trampsJoinedByUser].map((tramp) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Identifying the driver based on tremp type and Identifying the hitchhikers
            let driverId;
            let hitchhikers;
            if (tramp.tremp_type === 'driver') {
                driverId = tramp.creator_id;
                hitchhikers = yield Promise.all(tramp.users_in_tremp
                    .filter((user) => user.is_approved === 'approved')
                    .map((user) => getUserDetailsById(user.user_id)));
            }
            else {
                driverId = (_a = tramp.users_in_tremp.find((user) => user.is_approved === 'approved')) === null || _a === void 0 ? void 0 : _a.user_id;
                hitchhikers = yield getUserDetailsById(tramp.creator_id);
            }
            const driver = yield getUserDetailsById(driverId);
            return Object.assign(Object.assign({}, tramp), { driver: {
                    user_id: driver.user_id,
                    first_name: driver.first_name,
                    last_name: driver.last_name
                }, hitchhikers, users_in_tremp: undefined // Removing users_in_tremp from the response
             });
        })));
        return trampsToShow;
    });
}
exports.getApprovedTremps = getApprovedTremps;
function getUserDetailsById(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield userDataAccess.FindById(userId.toString());
            if (!user) {
                throw new Error('User not found');
            }
            return {
                user_id: user._id,
                first_name: user.first_name,
                last_name: user.last_name
            };
        }
        catch (error) {
            console.error('Error getting user details:', error);
            throw error;
        }
    });
}
// ##############################################
function getAllTremps() {
    return __awaiter(this, void 0, void 0, function* () {
        return trempDataAccess.FindAll({ deleted: false });
    });
}
exports.getAllTremps = getAllTremps;
function getTrempById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return trempDataAccess.FindByID(id);
    });
}
exports.getTrempById = getTrempById;
//# sourceMappingURL=TrempService.js.map