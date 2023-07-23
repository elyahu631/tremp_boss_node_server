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
    getPeopleAndTrempCounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        deleted: false
                    }
                },
                {
                    $addFields: {
                        approved_users_count: { $size: { $filter: { input: "$users_in_tremp", as: "user", cond: { $eq: ["$$user.is_approved", "approved"] } } } },
                        is_approved_trip: { $in: ["approved", "$users_in_tremp.is_approved"] }
                    }
                },
                {
                    $project: {
                        total_people: {
                            $cond: {
                                if: { $gt: ["$approved_users_count", 0] },
                                then: { $add: [1, "$approved_users_count"] },
                                else: "$approved_users_count"
                            }
                        },
                        is_approved_trip: 1
                    }
                },
                {
                    $group: {
                        _id: 1,
                        total_people: { $sum: "$total_people" },
                        total_approved_trips: { $sum: { $cond: { if: "$is_approved_trip", then: 1, else: 0 } } }
                    }
                },
                {
                    $project: {
                        total_people: 1,
                        total_approved_trips: 1,
                        average_people_per_trip: { $cond: { if: { $eq: ["$total_approved_trips", 0] }, then: 0, else: { $divide: ["$total_people", "$total_approved_trips"] } } }
                    }
                }
            ];
            const result = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            return result;
        });
    }
    getMostPopularRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $group: {
                        _id: { from_root: "$from_root.name", to_root: "$to_root.name" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 5
                }
            ];
            const popularRoutes = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            return popularRoutes;
        });
    }
    getTopDrivers() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        'users_in_tremp.is_approved': 'approved',
                        'deleted': false,
                        'tremp_type': 'driver'
                    }
                },
                {
                    $lookup: {
                        from: KpiDataAccess.UserCollection,
                        localField: 'creator_id',
                        foreignField: '_id',
                        as: 'driver_data'
                    }
                },
                {
                    $unwind: '$driver_data'
                },
                {
                    $group: {
                        _id: "$creator_id",
                        driverName: { $first: { $concat: ['$driver_data.first_name', '-', '$driver_data.last_name'] } },
                        driverEmail: { $first: "$driver_data.user_email" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
            ];
            const drivers = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            return drivers;
        });
    }
    getMostRequestedHours() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        'deleted': false,
                    }
                },
                {
                    $addFields: {
                        convertedTrempTime: {
                            $toDate: "$tremp_time"
                        }
                    }
                },
                {
                    $project: {
                        hour: { $hour: "$convertedTrempTime" }
                    }
                },
                {
                    $group: {
                        _id: "$hour",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 5
                },
            ];
            let hours = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            hours = hours.map(hour => (Object.assign(Object.assign({}, hour), { _id: hour._id + ':00' })));
            return hours;
        });
    }
    getRideAndTripCounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        deleted: false
                    }
                },
                {
                    $addFields: {
                        openRides: { $cond: [{ $eq: ["$tremp_type", "driver"] }, 1, 0] },
                        joinedRides: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$tremp_type", "driver"] },
                                        { $ne: [{ $size: "$users_in_tremp" }, 0] }
                                    ]
                                },
                                { $size: "$users_in_tremp" },
                                0
                            ]
                        },
                        openTrips: { $cond: [{ $eq: ["$tremp_type", "hitchhiker"] }, 1, 0] },
                        joinedTrips: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$tremp_type", "hitchhiker"] },
                                        { $ne: [{ $size: "$users_in_tremp" }, 0] }
                                    ]
                                },
                                { $size: "$users_in_tremp" },
                                0
                            ]
                        },
                    }
                },
                {
                    $group: {
                        _id: 1,
                        totalOpenRides: { $sum: "$openRides" },
                        totalJoinedRides: { $sum: "$joinedRides" },
                        totalOpenTrips: { $sum: "$openTrips" },
                        totalJoinedTrips: { $sum: "$joinedTrips" },
                    }
                },
            ];
            const result = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            return result;
        });
    }
    getHitchhikerMonthlyCountsByGender() {
        return __awaiter(this, void 0, void 0, function* () {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const creatorsPipeline = [
                {
                    $match: {
                        "create_date": { $gte: sixMonthsAgo },
                        "deleted": false
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'creator_id',
                        foreignField: '_id',
                        as: 'creator'
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$create_date" },
                            gender: "$creator.gender"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id.month": 1
                    }
                }
            ];
            const passengersPipeline = [
                {
                    $match: {
                        "create_date": { $gte: sixMonthsAgo },
                        "users_in_tremp.is_approved": 'approved',
                        "deleted": false
                    }
                },
                {
                    $unwind: '$users_in_tremp'
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'users_in_tremp.user_id',
                        foreignField: '_id',
                        as: 'passenger'
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$create_date" },
                            gender: "$passenger.gender"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id.month": 1
                    }
                }
            ];
            const [creatorsResult, passengersResult] = yield Promise.all([
                yield db.aggregate(KpiDataAccess.trempCollection, creatorsPipeline),
                yield db.aggregate(KpiDataAccess.trempCollection, passengersPipeline)
            ]);
            return {
                creators_by_month_and_gender: creatorsResult,
                passengers_by_month_and_gender: passengersResult
            };
        });
    }
}
KpiDataAccess.trempCollection = 'Tremps';
KpiDataAccess.UserCollection = 'Users';
exports.default = KpiDataAccess;
//# sourceMappingURL=KpiDataAccess.js.map