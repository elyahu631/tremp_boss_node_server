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
const mongodb_1 = require("mongodb");
const trempDataAccess = new TrempDataAccess_1.default();
function createTremp(tremp) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield trempDataAccess.insertTremp(tremp);
    });
}
exports.createTremp = createTremp;
function getTrempsByFilters(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            deleted: false,
            creator_id: { $ne: filters.creator_id },
            tremp_time: { $gt: filters.tremp_time },
            tremp_type: filters.type_of_tremp,
            'users_in_tremp.user_id': { $ne: filters.creator_id },
        };
        return yield trempDataAccess.FindTrempsByFilters(query);
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