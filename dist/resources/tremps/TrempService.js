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
exports.getUsersInTremp = exports.deleteTremp = exports.getUserTremps = exports.getTrempById = exports.approveUserInTremp = exports.addUserToTremp = exports.getTrempsByFilters = exports.getAllTremps = exports.createTremp = void 0;
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
function getAllTremps() {
    return __awaiter(this, void 0, void 0, function* () {
        return trempDataAccess.FindAll({ deleted: false });
    });
}
exports.getAllTremps = getAllTremps;
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
        let users = yield userDataAccess.FindAllUsers({ _id: { $in: uniqueUserIds } }, { first_name: 1, last_name: 1, image_URL: 1 });
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
    });
}
exports.getTrempsByFilters = getTrempsByFilters;
function addUserToTremp(tremp_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = new mongodb_1.ObjectId(user_id);
        const user = { user_id: id, is_approved: "pending" };
        const query = ({ $push: { users_in_tremp: user } });
        const updatedTremp = yield trempDataAccess.addUserToTremp(tremp_id, query);
        if (updatedTremp.matchedCount === 0) {
            throw new HttpException_1.NotFoundException('Tremp not found');
        }
        if (updatedTremp.modifiedCount === 0) {
            throw new HttpException_1.BadRequestException('User not added to the tremp');
        }
        const tremp = yield trempDataAccess.FindByID(tremp_id);
        const creatorId = tremp.creator_id;
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
function approveUserInTremp(tremp_id, creator_id, user_id, approval) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch the tremp using tremp_id
        const tremp = yield trempDataAccess.FindByID(tremp_id);
        // Check if the tremp exists
        if (!tremp) {
            throw new Error('Tremp does not exist');
        }
        // Check if the user making the request is the creator of the tremp
        if (tremp.creator_id.toString() !== creator_id) {
            throw new Error('Only the creator of the tremp can approve or disapprove participants');
        }
        // Find the user in the tremp
        const userIndex = tremp.users_in_tremp.findIndex((user) => user.user_id.toString() === user_id);
        // Check if the user is a participant in the tremp
        if (userIndex === -1) {
            throw new Error('User is not a participant in this tremp');
        }
        // Update the user's approval status
        tremp.users_in_tremp[userIndex].is_approved = approval;
        // Update the tremp in the database
        const result = yield trempDataAccess.Update(tremp_id, tremp);
        return result;
    });
}
exports.approveUserInTremp = approveUserInTremp;
function getTrempById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return trempDataAccess.FindByID(id);
    });
}
exports.getTrempById = getTrempById;
const mapTrempWithoutUsersInTremp = (tremp, approvalStatus) => {
    const { users_in_tremp } = tremp, otherProps = __rest(tremp, ["users_in_tremp"]);
    return Object.assign(Object.assign({}, otherProps), { approvalStatus });
};
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
            "users_in_tremp.user_id": userId,
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
function deleteTremp(tremp_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = new mongodb_1.ObjectId(user_id);
        const tremp = yield trempDataAccess.FindByID(tremp_id);
        // Check if the tremp exists
        if (!tremp) {
            throw new Error('Tremp does not exist');
        }
        // Check if the user requesting the delete is the creator of the tremp
        if (!tremp.creator_id.equals(userId)) {
            throw new Error('Only the creator of the tremp can delete it');
        }
        // Find users in the tremp who need to be notified
        const usersToNotify = tremp.users_in_tremp.filter((user) => user.is_approved === 'approved' || 'pending');
        if (usersToNotify.length > 0) {
            // Send notifications to all approved users
            // You'll need to fetch these users from the user database to get their notification tokens
            const userTokens = yield userDataAccess.FindAllUsers({ _id: { $in: usersToNotify.map((u) => new mongodb_1.ObjectId(u.user_id)) } }, { notification_token: 1 });
            for (const userToken of userTokens) {
                if (userToken.notification_token) {
                    // Use your notification function here
                    yield (0, sendNotification_1.sendNotificationToUser)(userToken.notification_token, "Tremp cancellation notice", "The tremp you joined has been cancelled.", { tremp_id: tremp_id, user_id: user_id });
                }
            }
        }
        // Delete the tremp
        return yield trempDataAccess.Update(tremp_id, { deleted: true });
    });
}
exports.deleteTremp = deleteTremp;
const getUsersInTremp = (trempId) => __awaiter(void 0, void 0, void 0, function* () {
    const tremp = yield trempDataAccess.FindByID(trempId);
    if (!tremp) {
        throw new HttpException_1.NotFoundException('Tremp not found');
    }
    const usersDetails = yield Promise.all(tremp.users_in_tremp.map((userInTremp) => __awaiter(void 0, void 0, void 0, function* () {
        const userIdString = userInTremp.user_id.toString();
        const user = yield userDataAccess.FindById(userIdString);
        return {
            user_id: userInTremp.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            image_URL: user.image_URL,
            gender: user.gender,
            is_confirmed: userInTremp.is_approved,
        };
    })));
    return usersDetails;
});
exports.getUsersInTremp = getUsersInTremp;
//# sourceMappingURL=TrempService.js.map