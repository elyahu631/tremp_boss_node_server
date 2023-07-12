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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveUserInTremp = exports.addUserToTremp = exports.getTrempsByFilters = exports.createTremp = void 0;
const TrempDataAccess_1 = __importDefault(require("./TrempDataAccess"));
const UserDataAccess_1 = __importDefault(require("../users/UserDataAccess"));
const mongodb_1 = require("mongodb");
const trempDataAccess = new TrempDataAccess_1.default();
const userDataAccess = new UserDataAccess_1.default();
function createTremp(tremp) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield trempDataAccess.insertTremp(tremp);
    });
}
exports.createTremp = createTremp;
function getTrempsByFilters(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = new mongodb_1.ObjectId(filters.creator_id);
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
        let tremps = yield trempDataAccess.FindTrempsByFilters(query);
        // Get all unique user IDs
        let uniqueUserIds = [...new Set(tremps.map(tremp => new mongodb_1.ObjectId(tremp.creator_id)))];
        console.log(uniqueUserIds);
        // Fetch all users in one operation
        let users = yield userDataAccess.FindAllUsers({ _id: { $in: uniqueUserIds } }, { first_name: 1, last_name: 1, photo_URL: 1 });
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
    });
}
exports.getTrempsByFilters = getTrempsByFilters;
function addUserToTremp(tremp_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = new mongodb_1.ObjectId(user_id);
        const user = { user_id: id, is_approved: "pending" };
        const query = ({ $push: { users_in_tremp: user } });
        return yield trempDataAccess.addUserToTremp(tremp_id, query);
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
        tremp.users_in_tremp[userIndex].is_approved = approval ? 'approved' : 'denied';
        // Update the tremp in the database
        const result = yield trempDataAccess.Update(tremp_id, tremp);
        return result;
    });
}
exports.approveUserInTremp = approveUserInTremp;
//# sourceMappingURL=TrempService.js.map