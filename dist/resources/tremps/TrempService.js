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
exports.getAllTremps = exports.getApprovedTremps = exports.getUsersInTremp = exports.deleteTremp = exports.getUserTremps = exports.getTrempById = exports.approveUserInTremp = exports.addUserToTremp = exports.getTrempsByFilters = exports.createTremp = void 0;
const TrempDataAccess_1 = __importDefault(require("./TrempDataAccess"));
const UserDataAccess_1 = __importDefault(require("../users/UserDataAccess"));
const mongodb_1 = require("mongodb");
const sendNotification_1 = require("../../services/sendNotification");
const HttpException_1 = require("../../middleware/HttpException");
const trempDataAccess = new TrempDataAccess_1.default();
const userDataAccess = new UserDataAccess_1.default();
const validateTrempData = (tremp) => {
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
};
function createTremp(tremp) {
    return __awaiter(this, void 0, void 0, function* () {
        validateTrempData(tremp);
        tremp.creator_id = new mongodb_1.ObjectId(tremp.creator_id);
        tremp.group_id = new mongodb_1.ObjectId(tremp.group_id);
        tremp.tremp_time = new Date(tremp.tremp_time);
        const user = yield userDataAccess.FindById(tremp.creator_id.toString());
        if (!user) {
            throw new HttpException_1.NotFoundException("Creator user does not exist");
        }
        return yield trempDataAccess.insertTremp(tremp);
    });
}
exports.createTremp = createTremp;
function getTrempsByFilters(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = new mongodb_1.ObjectId(filters.creator_id);
        const date = new Date(filters.tremp_time);
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
        let tremps = yield trempDataAccess.FindTrempsByFilters(query);
        // Get all unique user IDs
        let uniqueUserIds = [...new Set(tremps.map(tremp => new mongodb_1.ObjectId(tremp.creator_id)))]; //
        console.log(uniqueUserIds);
        // Fetch all users in one operation
        let users = yield userDataAccess.FindAllUsers({ _id: { $in: uniqueUserIds } }, { first_name: 1, last_name: 1, image_URL: 1, gender: 1 });
        console.log(users);
        // Convert users array to a map for efficient access
        let usersMap = new Map(users.map(user => [user._id.toString(), user]));
        // Add user details to tremps
        tremps.forEach(tremp => {
            tremp.participants_amount = getNumberOfApprovedUsers(tremp);
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
        return tremps;
    });
}
exports.getTrempsByFilters = getTrempsByFilters;
function addUserToTremp(tremp_id, user_id, participants_amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let userId = new mongodb_1.ObjectId(user_id);
        const participantsAmount = participants_amount ? participants_amount : 1;
        const user = { user_id: userId, participants_amount: participantsAmount, is_approved: "pending" };
        const query = ({ $push: { users_in_tremp: user } });
        const tremp = yield trempDataAccess.FindByID(tremp_id);
        const creatorId = tremp.creator_id;
        if (userId.equals(creatorId)) {
            throw new HttpException_1.BadRequestException('The creator can not join to tremp');
        }
        const updatedTremp = yield trempDataAccess.addUserToTremp(tremp_id, query);
        if (updatedTremp.matchedCount === 0) {
            throw new HttpException_1.NotFoundException('Tremp not found');
        }
        if (updatedTremp.modifiedCount === 0) {
            throw new HttpException_1.BadRequestException('User not added to the tremp');
        }
        const creator = yield userDataAccess.FindById(creatorId);
        const fcmToken = creator.notification_token;
        if (fcmToken) {
            yield (0, sendNotification_1.sendNotificationToUser)(fcmToken, 'New User Joined Drive', 'A user has joined your drive.', { tremp_id, user_id });
        }
        else {
            console.log('User does not have a valid FCM token');
        }
    });
}
exports.addUserToTremp = addUserToTremp;
function getNumberOfApprovedUsers(tremp) {
    if (!tremp.users_in_tremp || tremp.users_in_tremp.length === 0) {
        return 0;
    }
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
function getTrempById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return trempDataAccess.FindByID(id);
    });
}
exports.getTrempById = getTrempById;
function mapTrempWithoutUsersInTremp(tremp, approvalStatus) {
    const { users_in_tremp } = tremp, otherProps = __rest(tremp, ["users_in_tremp"]);
    return Object.assign(Object.assign({}, otherProps), { approvalStatus });
}
;
function getUserTremps(user_id, tremp_type) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = new mongodb_1.ObjectId(user_id);
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
        const driverTremps = yield trempDataAccess.FindAll(driverQuery);
        const driverTrempsMapped = driverTremps.map(tremp => {
            const approvalStatus = getApprovalStatus(tremp, userId, first);
            return mapTrempWithoutUsersInTremp(tremp, approvalStatus);
        });
        const hitchhikerTremps = yield trempDataAccess.FindAll(hitchhikerQuery);
        const hitchhikerTrempsMapped = hitchhikerTremps.map(tremp => {
            const approvalStatus = getApprovalStatus(tremp, userId, second);
            return mapTrempWithoutUsersInTremp(tremp, approvalStatus);
        });
        const tremps = [...driverTrempsMapped, ...hitchhikerTrempsMapped];
        return tremps;
    });
}
exports.getUserTremps = getUserTremps;
function getApprovalStatus(tremp, userId, tremp_type) {
    const isCreator = tremp.creator_id.equals(userId);
    const userInTremp = tremp.users_in_tremp.find((user) => user.user_id.equals(userId));
    const noApplicantsMessage = tremp_type === 'driver' ? 'no applicants' : 'no bidders';
    const awaitingApprovalMessage = 'awaiting approval from me';
    const allApprovedMessage = 'all approved';
    // Check if the user is the creator
    if (isCreator) {
        console.log('User is the creator');
        if (tremp.users_in_tremp.length === 0) {
            return noApplicantsMessage;
        }
        else {
            const pending = tremp.users_in_tremp.some((user) => user.is_approved === 'pending');
            const denied = tremp.users_in_tremp.every((user) => user.is_approved === 'denied');
            if (pending)
                return awaitingApprovalMessage;
            if (denied)
                return noApplicantsMessage;
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
                participants_amount: userInTremp.participants_amount,
            };
        })));
        return usersDetails;
    });
}
exports.getUsersInTremp = getUsersInTremp;
;
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
function getAllTremps() {
    return __awaiter(this, void 0, void 0, function* () {
        return trempDataAccess.FindAll({ deleted: false });
    });
}
exports.getAllTremps = getAllTremps;
//# sourceMappingURL=TrempService.js.map