"use strict";
// src/resources/kpis/KpiDataAccess.ts
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
const db_1 = __importDefault(require("../../utils/db"));
const db = new db_1.default();
class KpiDataAccess {
    getTotalTremps() {
        return __awaiter(this, void 0, void 0, function* () {
            const rideRequests = yield db.CountCollection(KpiDataAccess.trempCollection, { tremp_type: 'hitchhiker' });
            const ApprovedRequests = yield db.CountCollection(KpiDataAccess.trempCollection, { tremp_type: 'hitchhiker', 'users_in_tremp.is_approved': 'approved', 'deleted': false });
            const rideOffers = yield db.CountCollection(KpiDataAccess.trempCollection, { tremp_type: 'driver' });
            const approvedOffers = yield db.CountCollection(KpiDataAccess.trempCollection, { tremp_type: 'driver', 'users_in_tremp.is_approved': 'approved', 'deleted': false });
            const allApprovedTremps = yield db.CountCollection(KpiDataAccess.trempCollection, { 'users_in_tremp.is_approved': 'approved', 'deleted': false });
            return {
                rideRequests,
                ApprovedRequests,
                rideOffers,
                approvedOffers,
                allApprovedTremps
            };
        });
    }
    getTotalTrempsByGender() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        'users_in_tremp.is_approved': 'approved',
                        'deleted': false
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'creator_id',
                        foreignField: '_id',
                        as: 'creator_details'
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'users_in_tremp.user_id',
                        foreignField: '_id',
                        as: 'users_in_tremp_details'
                    }
                },
                {
                    $project: {
                        users: {
                            $concatArrays: ['$creator_details', '$users_in_tremp_details']
                        }
                    }
                },
                {
                    $unwind: '$users'
                },
                {
                    $group: {
                        _id: '$users.gender',
                        count: { $sum: 1 }
                    }
                }
            ];
            const result = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            const genderStats = result.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, { M: 0, F: 0 });
            return genderStats;
        });
    }
}
KpiDataAccess.trempCollection = 'Tremps';
KpiDataAccess.UserCollection = 'Users';
exports.default = KpiDataAccess;
//# sourceMappingURL=KpiDataAccess.js.map